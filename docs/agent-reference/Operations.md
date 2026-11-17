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
pnpm api:dev             # the API Worker locally (`wrangler dev`, port 8787, or `API_PORT=`); the webapp's `/api` proxy points at it (`API_URL=` for another port); see `api/AGENTS.md`
pnpm test:properties     # engine property tests, which `pnpm checks` leaves out
pnpm evals               # root command planned; use package evals:fake/local/paid today. The AI evals (`ai`); costs money, so `pnpm checks` leaves them out
```

`pnpm checks` is the gate (`--max-warnings=0`). It deliberately leaves out the property tests — a
fresh seed every run means a failure isn't reproducible from the same commit, so it can't gate a
deploy — and the evals, which call a model, cost money, and are non-deterministic. The property-test command is implemented; run it when engine changes require it. For prompt/graph changes, use the implemented AI package eval commands and preserve paid authorization/spend controls.


## Development worktrees and the integration checkout

**The main checkout (`main`) is integration-only. All development happens in persona worktrees**, including fixes, tests, tooling, assets and development documentation. Main is for reviewing incoming commits, merging branches, resolving merge conflicts and validating the combined result. If validation reveals a behavior defect, fix it in the owning worktree and integrate that fix; do not develop the fix on main.

The flow is **persona worktree → main → persona worktrees**. A merge into main does not update another worktree's files: each worktree explicitly merges the updated local main. Model assignment does not change this workflow.

1. **Select the right checkout.** At every session start, inspect `git status`, `git branch --show-current` and `git worktree list`. Continue in the persona's assigned development worktree, never the main checkout. Existing legacy worktrees may keep their names until their remaining work is handed over; record the actual path/branch in that persona's resume. Create/reuse a dedicated persona worktree when authorized; do not repurpose a worktree containing someone else's unfinished work.
2. **Sync from main before new work.** With the worktree's tracked state clean, merge the local main branch into its development branch: `git -C <persona-worktree> merge main`. Commit or hand over unfinished work through the authorized commit flow first; never stash, discard or move another session's work to make a merge possible. If main has pending uncommitted integration changes, those are not part of the sync: wait for their integration commit before relying on them. **This is the user's standing instruction (2026-11-16) for every fresh turn:** run `git log --oneline HEAD..main`, and if main has moved, merge it before any work and commit the merge unasked as `chore: merge main into <branch>`. It is the one commit a session makes unasked, and only the merge, never its own work. Resolve the conflicts yourself (shared docs keep both sides, code is merged by meaning) and ask the user only when two sides disagree on behaviour, not on wording. Re-run the affected checks before committing: a clean text merge proves nothing, and main's new lint rules reach your files through it. If the tree is dirty mid-turn, say so rather than stashing.
3. **Install and test independently.** Each worktree has its own dependencies: `pnpm install --frozen-lockfile --offline` (if offline metadata is missing, report it before a network retry). Run the app on its own port with `--strictPort` and point Playwright's `WEBAPP_URL` there. Never reuse or kill another session's server.
4. **Develop and keep context in the worktree.** Follow acceptance/eval-first rules and update the persona TODO, its shared status row and relevant handoff sections there. Use targeted edits to shared coordination files so merges preserve other personas' updates. Shared branches, remotes and stash still require the root concurrency precautions even though the working directories/indexes are separate.
5. **Prepare a reviewed delivery.** Run `pnpm checks` and the relevant production-preview acceptance/property/eval checks in the development worktree. Report exact results and the commit(s) to integrate. Commits still require the existing authorization; otherwise leave changes uncommitted for the user to review/commit. No push is implied.
6. **Integrate in main, one branch at a time.** Start from a clean main checkout and merge only reviewed, committed work: `git -C <main-checkout> merge --no-ff <persona-branch>`. Preserve unrelated changes and resolve overlapping TODO/status/handoff edits without losing either side's tasks. Do not rebase shared worktree branches or change their history as part of this flow. Existing git-write authorization rules apply.
7. **Validate the merged result in main.** Run `pnpm checks` and relevant production-preview acceptance/property checks for the integrated change. A clean textual merge is not sufficient. Record the tested main commit and actual result in the integration handoff; any integration-record-only update is coordination, not permission for development on main.
8. **Sync back out.** Each persona merges the resulting main commit into its clean development branch before resuming, resolves conflicts in that worktree, and reruns checks relevant to the merge. Record the last merged main commit in its resume. Main may advance again while work continues; sync again before delivery and revalidate the combined worktree result. Coordinate merge timing with active sessions; never run a merge into a worktree whose owner is editing.
9. **Keep the worktrees.** Persona worktrees are persistent across slices and context clears. Do not automatically remove them, delete their branches, unlock them or clean unfinished files after integration. Stop only the servers you started, by their process/port.

Pushing remains the user's. This policy does not authorize extra commits, branch changes or destructive git operations beyond the instructions already given for a task.


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

