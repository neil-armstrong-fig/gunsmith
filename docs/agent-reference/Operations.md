# Operational reference

Read the section relevant to your task. Root `AGENTS.md` remains authoritative. Commands marked planned may not exist; inspect package scripts first.

## Commands

While working, scope tools to what you changed (e.g. `pnpm --filter @gunsmith/engine exec vitest run
src/visibility`). Before finishing:

```bash
pnpm checks              # lint + format check + type check + unit tests, every package
pnpm format              # exists; in shared checkouts format only explicitly touched paths
pnpm lint:fix            # exists; do not run repo-wide rewrites in a shared checkout
pnpm start               # dev server on http://localhost:3000 — fine for a few specs, or work in progress
pnpm start:preview       # compile, then serve the build on http://localhost:3000 — what CI tests
pnpm acceptance-tests    # needs one of the two running in another terminal; preview for the whole suite
pnpm install-browsers    # one-time Playwright chromium download
pnpm api:dev             # planned, not implemented: the API Worker locally (`wrangler dev`, port 8787); see `api/AGENTS.md`
pnpm test:properties     # planned, not implemented: the property tests, which `pnpm checks` leaves out
pnpm evals               # root command planned; use package evals:fake/local/paid today. The AI evals (`ai`); costs money, so `pnpm checks` leaves them out
```

`pnpm checks` is the gate (`--max-warnings=0`). It deliberately leaves out the property tests — a
fresh seed every run means a failure isn't reproducible from the same commit, so it can't gate a
deploy — and the evals, which call a model, cost money, and are non-deterministic. The property-test command is not implemented yet: report that limitation rather than claiming a property run. For prompt/graph changes, use the implemented AI package eval commands and preserve paid authorization/spend controls.


## Working on a feature in a worktree

**Work in the main checkout, however big the change. Use a worktree only when asked.** The rest of
this section is for then. `EnterWorktree` makes one under `.claude/worktrees/<name>` on branch
`worktree-<name>` (`git worktree add` does the same by hand).

1. **Install its own dependencies** — a worktree has no `node_modules`:
   `pnpm install --frozen-lockfile --offline`.
2. **The files are yours; the repository isn't.** Branches, remotes and the stash are shared with
   every other checkout, so the concurrency rules above still hold — above all, never `git stash` in
   a worktree. Set work aside with a WIP commit on your own branch instead.
3. **Run the app on a port of your own** and point specs at it (`pnpm start:preview --port 3100`, or
   `pnpm start --port 3100 --strictPort` while writing a spec, then
   `WEBAPP_URL=http://localhost:3100` for Playwright), or you'll test somebody else's code.
4. **Verify before handing over**: `pnpm checks` and the acceptance suite against your own port.
5. **Stop, and leave the work uncommitted.** Say what changed and what you ran — the branch is
   reviewed and committed by hand.
6. **Integrate from the main checkout only, once that commit exists.** Default to a real merge
   (`git -C /path/to/main-checkout merge worktree-<name>`), not a fast-forward — it's the safer choice
   where main may have moved on. For a linear history instead, rebase the worktree branch onto main
   first and fast-forward main onto the result (`git merge --ff-only worktree-<name>`); ask before
   rewriting a worktree branch that another worktree or session might still be building on. **A clean text
   merge proves nothing**: re-run `pnpm checks` (and the acceptance suite where both sides touched the same
   area) from the main checkout after either route, then tear down: `git worktree remove
   .claude/worktrees/<name>` and `git branch -d worktree-<name>`.
7. **Kill any dev server you started by process, not wrapper** — `pkill -f "vite.*--port <port>"`, or
   the next `--strictPort` start fails with "Port is already in use".

Pushing is the human's, always.


## Gotchas that will waste your time

These are janggi's, carried over until each is re-checked against the versions actually installed.

- **Do not upgrade TypeScript past 6.0.3.** Re-checked 2026-11-12: TS 7.0.2 is `latest`, but `typescript-eslint` 8.72.x
  still declares `typescript >=4.8.4 <6.1.0`, so ESLint cannot read TS 7. Re-check when typescript-eslint's peer range
  moves.
- **Port 3000 may already be taken by janggi's dev server** (`strictPort` makes `pnpm start` fail rather than move). Do not
  kill it; run `pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` instead.
- **Do not add `baseUrl` to a tsconfig.** TS 6 made it an error — `paths` already resolve relative to
  the tsconfig's own directory.
- **`pnpm setup` and `pnpm deploy` are built-in pnpm commands**, not ours. The scripts are `pnpm install-browsers` and
  `pnpm --filter @gunsmith/infra provision`.
- **Root-level files get no Prettier config from a package directory** — `AGENTS.md` and `docs/`
  fall back to 80 columns and rewrap content you never touched. Edit them by hand.
- **The canvas is not in the DOM.** react-three-fiber draws to a `<canvas>`, so Playwright cannot find a player or a
  wall by role. The DSL reads game state through one deliberate state hook (`HANDOFF.md`); it is shipped code, so keep it
  read-only and tiny.
- **`pnpm checks` needs `glslangValidator` on the PATH** (`brew install glslang`; `apt install glslang-tools`): the webapp's shader test runs it
  (`docs/shaders.md`), and without it that test fails saying so. A CI runner must install it too.
- On Linux/WSL, Chromium needs system libraries once:
  `pnpm --filter @gunsmith/acceptance-tests exec playwright install-deps chromium` (needs sudo), or
  every acceptance test fails on browser launch with `libnspr4.so`.
- **LangSmith on Workers:** with `nodejs_compat_populate_process_env` the tracing variables are read (checked 2026-11-12;
  without the flag, pass the config to the client explicitly). **Flush on every request path with
  `ctx.waitUntil(awaitAllCallbacks())`**: an unflushed trace is lost and the orphaned batch can hang the next request that
  awaits a flush (`docs/ai-hosting.md`). Avoid streaming until it is verified.
- **Cloudflare has no hard spend cap.** Budget alerts are email only. The kill switch is ours (`docs/cost-and-budget.md`).


## CI and deployment (planned)

`ci.yml` runs `checks`, then `acceptance-tests` against a production build (`vite preview`), then
deploys `main` with Alchemy (`deploy`: the database, its migrations, the Worker with its static assets and the Durable
Objects, from `infra/`), gated on both, and does nothing until the `CLOUDFLARE_API_TOKEN` secret exists. After the deploy it
runs the acceptance suite once more against the live address. `property-tests.yml` and `evals.yml` run on push/PR
and on demand, and go **red on failure but gate nothing** (a fresh seed, or a model, means a failure isn't reproducible
from the same commit) — except that `evals.yml` is the AI regression gate **for changes under `ai/`**; `ai` decides
whether that becomes a required check, as `docs/ai-pipeline.md` explains. **If branch protection is ever turned on,
leave the property tests out of required checks.**

One Worker serves both the site (static assets) and `/api/*` (`run_worker_first: ["/api/*"]`) at
`gunsmith.neilarmstrong.dev`, DNS at Cloudflare, so the session cookie is same-origin. Environments: local and `prod`
only (a throwaway Cloudflare account for the first deploy).


## Manual setup

Some of this project lives outside the repository: the Google OAuth client, the Cloudflare API token and Worker domain,
the AI Gateway and its spend limits, the provider key and its hard cap, the LangSmith key, the Cloudflare budget
alerts, the GitHub secrets. `MANUAL-SETUP-STEPS.md` lists every such step, and why. **Update it in the same pass as any
change that creates, renames or removes one** (a new secret, console setting, DNS record or workflow permission), and
never put an account id, token, secret or personal address in it.

