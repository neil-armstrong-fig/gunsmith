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
pnpm api:dev             # the API Worker locally (`wrangler dev`, port 8787, or `API_PORT=`); the webapp's `/api` proxy points at it (`API_URL=` for another port); it trusts localhost pages at any port (`--var ALLOW_LOOPBACK_ORIGINS:true`); see `api/AGENTS.md`
pnpm --filter @gunsmith/api db:migrate:local   # applies api/migrations to the local D1 (sign-in needs it; guests do not); `db:generate -- --name=<change>` writes a new migration
pnpm test:properties     # property tests (engine, webapp/src/online, api/src/durable-objects/match), which `pnpm checks` leaves out
pnpm evals               # complete free fake harness, all criteria gating; no model calls or traces
pnpm deploy:fromLocal    # manual production release from this checkout (needs the root `.env.local`); see MANUAL-SETUP-STEPS.md#first-deploy
```

`pnpm checks` is the gate (`--max-warnings=0`). It deliberately leaves out the property tests — a
fresh seed every run means a failure isn't reproducible from the same commit, so it can't gate a
deploy — and model evals, which cost money and are non-deterministic. The free fake harness runs separately through `pnpm evals`. The property-test command is implemented; run it when engine changes require it. For prompt/graph changes, use the implemented AI package eval commands and preserve paid authorization/spend controls.


## Development worktrees and GitHub's main

There is no integration checkout: each worktree exchanges work with `origin/main` directly, through the
[`sync-with-github` skill](../../.agents/skills/sync-with-github/SKILL.md). The super turn that merged persona worktrees into `main` was
retired on 2026-11-19.

1. **Select the checkout.** At session start, inspect `git status`, `git branch --show-current` and `git worktree list`. A standing
   session (ai or netcode) continues in `.claude/worktrees/<session>` on `worktree-<session>`; an ad hoc session works where the user
   says. Never repurpose a worktree that holds someone else's unfinished work.
2. **Bring `main` in before new work.** `git fetch origin`, then `git log --oneline HEAD..origin/main`. Fast-forward a branch with
   nothing of its own; otherwise `git merge --no-ff --no-commit origin/main`, resolve, rerun the affected checks and commit
   `chore: merge main into <branch>`. Ask the user about conflicting behaviour.
3. **Install and test independently.** Each worktree has its own dependencies: `pnpm install --frozen-lockfile --offline` (if offline
   metadata is missing, report it before a network retry). Run the app on its own port with `--strictPort` and point Playwright's
   `WEBAPP_URL` there. Never reuse or kill another session's server.
4. **Deliver.** Run `pnpm checks` and the relevant production-preview acceptance, property or free fake eval checks, report the exact
   results, and update your checklist, the status board and `HANDOFF.md`. Leave the work uncommitted for the user, with a suggested
   Conventional Commit message.
5. **Push.** After the user commits, push with a plain fast-forward (`git push origin HEAD:main`); never force. If `main` moved, fetch
   and merge again first.
6. **Keep the worktrees.** Worktrees persist across slices and context clears. Do not remove them, delete their branches or clean
   unfinished files unless the user asks. Stop only the servers you started, by their process or port.

## Gotchas that will waste your time

Re-check version-specific limitations before relying on them.

- **Do not upgrade TypeScript past 6.0.3.** Re-checked 2026-11-27: TS 7.0.2 is `latest`, but `typescript-eslint` 8.74.0
  still declares `typescript >=4.8.4 <6.1.0`, so ESLint cannot read TS 7. Re-check when typescript-eslint's peer range
  moves.
- **Port 3000 may already be taken by another local server** (`strictPort` makes `pnpm start` fail rather than move). Do not
  kill it; run `pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` instead.
- **Do not add `baseUrl` to a tsconfig.** TS 6 made it an error — `paths` already resolve relative to
  the tsconfig's own directory.
- **`pnpm setup` and `pnpm deploy` are built-in pnpm commands**, not ours. The scripts are `pnpm install-browsers` and
  `pnpm --filter @gunsmith/infra provision` (or the whole manual release, `pnpm deploy:fromLocal`).
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


## CI and deployment

CI (`.github/workflows/ci.yml`) runs `pnpm checks` and production-preview acceptance on main pushes, pull requests and manual dispatch. Ubuntu runners use Node 26.13.0, the root's pinned pnpm and frozen installation. Checks installs the missing FFmpeg or `glslang-tools` packages without APT recommendations, with bounded retries and a ten-minute install limit. Main saves downloaded `.deb` files after installation, keyed by runner image, architecture and required packages. APT refreshes its indexes and fetches any archives missing from the cache. Checks compiles the frontend, validates both Worker bundles and publishes one release artifact after `pnpm checks` passes. Each of the four preview shards installs Chromium with system dependencies, downloads that build and uses one Playwright worker with GitHub, line and blob reporters. Playwright stops at 20 minutes to leave report-upload time inside the 30-minute job. Matrix fail-fast is disabled. Checks and preview acceptance use read-only contents permissions and need no repository secrets.

Each shard preserves its blob (including failure/retry attachments) as `playwright-blob-N` for seven days. Deployment depends directly on all four preview shards passing. Reruns replace that shard's artifact. To view a combined report locally, put the downloaded blob ZIPs in `acceptance-tests/all-blob-reports/` and run `pnpm --filter @gunsmith/acceptance-tests exec playwright merge-reports --reporter=html all-blob-reports`.

The split-release hosted baseline on `bc47751` took 36m 06s elapsed and 98m 04s summed runner time. Checks took 3m 52s (2m 32s for `pnpm checks`), the release build took 56s, the four shard jobs took 18m 51s, 30m 17s, 13m 14s and 30m 03s, and reporting took 51s. Two shards timed out without uploading blobs. Compare the next hosted run's setup, build, test and report durations and first-pass results. The earlier unsharded local baseline was 6.3 minutes with a smaller suite and different load. [Hosted baseline](https://github.com/neil-armstrong-fig/gunsmith/actions/runs/44734250787)

`pnpm acceptance-tests:preview:local` compiles the production frontend, then starts an isolated local Worker and Vite preview through Playwright. CI uses the same managed mode (`PREVIEW_ACCEPTANCE=1`, `PREVIEW_API_MODE=local`) after its separate build step. No Cloudflare account or credentials are required. The Worker binds loopback, uses a dynamic inspector port and keeps state under `api/.wrangler/acceptance-<port>/`, separate from ordinary development. Readiness uses TCP for the Worker and HTTP for Vite; existing servers are refused. Playwright stops only its managed process groups on completion, startup failure or interruption.

Defaults are frontend `http://127.0.0.1:3107` and Worker `http://127.0.0.1:8788`. Set `PREVIEW_PORT` and `PREVIEW_API_PORT` to distinct integers from 1 to 65535 for another worktree. Example: `PREVIEW_PORT=3108 PREVIEW_API_PORT=8789 pnpm acceptance-tests:preview:local`.

`API_URL=https://api.example.com pnpm acceptance-tests:preview:api` runs the locally built frontend against a separately running local or deployed API. Supply an HTTP(S) origin without credentials, paths, queries or fragments. Only Vite starts; its proxy forwards HTTP and WebSockets with the upstream Host and normal TLS verification. The external API stays running and failures never fall back to a local Worker. Extra Playwright arguments pass through both scripts.

The original `pnpm acceptance-tests:preview` selects external mode when `API_URL` is supplied, otherwise local mode. `PREVIEW_API_MODE=local|external` overrides that selection; the explicit scripts set it, and external mode requires `API_URL`. Ordinary `WEBAPP_URL=https://game.example.com pnpm acceptance-tests` still targets an already running complete application and starts neither server.

The separate `property-tests.yml` runs on main pushes/PRs, daily at 03:17 UTC and manually. It uses 1,000 cases per property for commit runs and 5,000 for scheduled/manual runs, with a positive-integer manual override. Each hosted property gets five minutes within the 20-minute job. All three package suites report independently and any failure makes the job red. Logs preserve fast-check seeds, paths and counterexamples for fourteen days. **Never add property tests to required release checks or make CI/deployment depend on them.** Preview acceptance keeps two retries. The known `ShootingAcrossLevels` flake is an Engine and Play follow-up.

The release job stays disabled until the owner sets `GUNSMITH_DEPLOY_ENABLED=true`. Enabled runs for the current `main` commit use Alchemy for the API Worker, D1 and Durable Object migrations. Wrangler deploys the tested artifact to the static webapp Worker. The release build requires the static-asset `noindex` rule. After the site reports the deployed SHA, the homepage returns `X-Robots-Tag: noindex` and the API answers the credentialed webapp origin and the D1 session lookup succeeds, four Playwright shards run against the deployed URL and publish `playwright-live-blob-N` artifacts. Main runs serialize through live acceptance. See [manual setup](../../MANUAL-SETUP-STEPS.md#first-deploy) for credentials, first deploy and rollback. The independent AI eval harness workflow runs the free full fake suite on relevant changes and preserves JSON summaries for fourteen days. It uses no secrets or model calls. Paid runs remain manual/local only; AI owns their selection, guard and evidence implementation. See [eval policy](EvalPolicy.md).

Cloudflare serves the static webapp at `gunsmith.neilarmstrong.dev` and the API Worker at
`gunsmith-api.neilarmstrong.dev`. The browser opens room WebSockets directly on the API hostname. Credentialed
HTTP requests allow the exact webapp origin, and cached preflights avoid repeated requests against the free quota.
Production serves `X-Robots-Tag: noindex` on webapp assets until indexing is enabled by a reviewed release.


## Manual setup

Some of this project lives outside the repository: the Google OAuth client, the Cloudflare API token and Worker domain,
the AI Gateway and its spend limits, the provider key and its hard cap, the LangSmith key, the Cloudflare budget
alerts, the GitHub secrets. `MANUAL-SETUP-STEPS.md` lists every such step, and why. **Update it in the same pass as any
change that creates, renames or removes one** (a new secret, console setting, DNS record or workflow permission), and
never put an account id, token, secret or personal address in it.

