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
```

`pnpm checks` is the gate (`--max-warnings=0`). It deliberately leaves out the property tests — a
fresh seed every run means a failure isn't reproducible from the same commit, so it can't gate a
deploy — and model evals, which cost money and are non-deterministic. The free fake harness runs separately through `pnpm evals`. The property-test command is implemented; run it when engine changes require it. For prompt/graph changes, use the implemented AI package eval commands and preserve paid authorization/spend controls.


## Development worktrees and the integration checkout

**The main checkout (`main`) is integration-only. All development happens in persona worktrees**, including fixes, tests, tooling, assets and development documentation. Main is for reviewing incoming commits, merging branches, resolving merge conflicts and validating the combined result. If validation reveals a behavior defect, fix it in the owning worktree and integrate that fix; do not develop the fix on main.

The flow is **persona worktree → main → persona worktrees**. The user decides when to start a **super turn** from `main`. Invocation starts the worktree checks, even if another session is unavailable. One integration session reviews the committed deliveries, validates `main`, and then fast-forwards every included persona worktree to the same commit. The [project skill](../../.agents/skills/integrate-worktrees/SKILL.md) implements steps 6–9 for Codex and Claude Code via `.claude/skills/integrate-worktrees`. This guide governs the workflow.

1. **Select the right checkout.** At every session start, inspect `git status`, `git branch --show-current` and `git worktree list`. Continue in the persona's assigned development worktree, never the main checkout. Existing legacy worktrees may keep their names until their remaining work is handed over; record the actual path/branch in that persona's resume. Create/reuse a dedicated persona worktree when authorized; do not repurpose a worktree containing someone else's unfinished work.
2. **Check main before new work.** The user's standing instruction is to run `git log --oneline HEAD..main` every fresh turn. After a super turn this should be empty. If committed `main` has advanced outside a super turn, sync before working or delivering. From a clean worktree use `git merge --ff-only --no-overwrite-ignore main` if `HEAD` is an ancestor of `main`. If the branches diverged, use `git merge --no-ff --no-commit --no-overwrite-ignore main`, resolve compatible changes and rerun affected checks before making the authorized merge commit `chore: merge main into <branch>`. Ask the user about conflicting behaviour. Preserve unfinished work and hand it over through the authorized commit flow if it blocks the sync.
3. **Install and test independently.** Each worktree has its own dependencies: `pnpm install --frozen-lockfile --offline` (if offline metadata is missing, report it before a network retry). Run the app on its own port with `--strictPort` and point Playwright's `WEBAPP_URL` there. Never reuse or kill another session's server.
4. **Develop and keep context in the worktree.** Follow acceptance/eval-first rules and update the persona TODO, its shared status row and relevant handoff sections there. Use targeted edits to shared coordination files so merges preserve other personas' updates. Shared branches, remotes and stash still require the root concurrency precautions even though the working directories/indexes are separate.
5. **Prepare a reviewed delivery.** Run `pnpm checks` and the relevant production-preview acceptance/property/eval checks in the development worktree. Report exact results and the commit(s) to integrate. Commits still require the existing authorization; otherwise leave changes uncommitted for the user to review/commit. No push is implied.
6. **Preflight and integrate the batch.** Require clean `main` with no operation pending. Check that all seven assigned worktrees are present, on their assigned branch, clean (including untracked files), unlocked and free of pending Git operations. If any persona checkout is blocked, report its name and blocker. Ask the user whether to skip those specific worktrees and leave any approved exclusions and their deliveries for a later run. Snapshot the included tips, recheck before writing, and merge the reviewed deliveries one at a time using `git -C <main-checkout> merge --no-ff --no-commit --no-overwrite-ignore <reviewed-tip>`. Inspect each staged result, resolve compatible changes and run affected checks before committing. Explicitly targeted requests can review committed deliveries from dirty or locked sources and write only to `main`.
7. **Validate and record the merged result.** Run `pnpm checks` and relevant production-preview acceptance, property or free fake eval checks in `main`. Record the tested commit and actual results in the integration handoff. Commit the coordination record before pinning the final `main` SHA for the return sync. Failure blocks that sync. Route fixes through the owning persona and revalidate before distributing `main`.
8. **Sync the included worktrees before the next turn.** Verify the reviewed tips are in `main`. Recheck the tips and readiness of the included checkouts. Use `git -C <persona-worktree> merge --ff-only --no-overwrite-ignore <final-main-sha>` for each included persona still behind the pinned SHA. Finish when all included checkouts are clean and have that exact `HEAD`. Report any new blocker and which checkouts advanced. Resume after the blocker clears or the user approves leaving that checkout out. Report all exclusions. The user’s super-turn request authorizes these fast-forwards. After a targeted integration, owners still apply step 2 themselves. Each persona records its last synced main commit in its own resume.
9. **Keep the worktrees.** Persona worktrees are persistent across slices and context clears. Do not automatically remove them, delete their branches, unlock them or clean unfinished files after integration. Stop only the servers you started, by their process/port.

Pushing remains the user's. This policy does not authorize extra commits, branch changes or destructive git operations beyond the instructions already given for a task.


## Gotchas that will waste your time

Re-check version-specific limitations before relying on them.

- **Do not upgrade TypeScript past 6.0.3.** Re-checked 2026-11-12: TS 7.0.2 is `latest`, but `typescript-eslint` 8.72.x
  still declares `typescript >=4.8.4 <6.1.0`, so ESLint cannot read TS 7. Re-check when typescript-eslint's peer range
  moves.
- **Port 3000 may already be taken by another local server** (`strictPort` makes `pnpm start` fail rather than move). Do not
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


## CI and deployment

CI (`.github/workflows/ci.yml`) runs `pnpm checks` and production-preview acceptance on main pushes, pull requests and manual dispatch. Ubuntu runners use Node 26.13.0, the root's pinned pnpm and frozen installation. Checks installs FFmpeg and `glslang-tools` only when a required executable is missing, with bounded APT retries and a five-minute step limit. A separate job compiles and checks one release artifact. Each of the four preview shards installs Chromium with system dependencies, downloads that build and uses one Playwright worker with GitHub, line and blob reporters. Playwright stops at 20 minutes to leave report-upload time inside the 30-minute job. Matrix fail-fast is disabled. The checks, build and preview jobs use read-only contents permissions and need no repository secrets.

Each shard preserves its blob (including failure/retry attachments) as `playwright-blob-N` for seven days. The final `Acceptance tests (production preview)` job downloads available blobs and publishes one combined HTML artifact, `playwright-preview`, also for seven days. It runs after failed shards too, but succeeds only when every shard succeeds, all four reports exist and merging/publication succeed. Partial reports identify missing shards; they never satisfy the gate. Reruns replace that shard's artifact and the combined report. The report job installs dependencies but no browser. Deployment depends on checks and this final acceptance job.

The split-release hosted baseline on `bc47751` took 36m 06s elapsed and 98m 04s summed runner time. Checks took 3m 52s (2m 32s for `pnpm checks`), the release build took 56s, the four shard jobs took 18m 51s, 30m 17s, 13m 14s and 30m 03s, and reporting took 51s. Two shards timed out without uploading blobs. Compare the next hosted run's setup, build, test and report durations and first-pass results. The earlier unsharded local baseline was 6.3 minutes with a smaller suite and different load. [Hosted baseline](https://github.com/neil-armstrong-fig/gunsmith/actions/runs/44734250787)

`pnpm acceptance-tests:preview:local` compiles the production frontend, then starts an isolated local Worker and Vite preview through Playwright. CI uses the same managed mode (`PREVIEW_ACCEPTANCE=1`, `PREVIEW_API_MODE=local`) after its separate build step. No Cloudflare account or credentials are required. The Worker binds loopback, uses a dynamic inspector port and keeps state under `api/.wrangler/acceptance-<port>/`, separate from ordinary development. Readiness uses TCP for the Worker and HTTP for Vite; existing servers are refused. Playwright stops only its managed process groups on completion, startup failure or interruption.

Defaults are frontend `http://127.0.0.1:3107` and Worker `http://127.0.0.1:8788`. Set `PREVIEW_PORT` and `PREVIEW_API_PORT` to distinct integers from 1 to 65535 for another worktree. Example: `PREVIEW_PORT=3108 PREVIEW_API_PORT=8789 pnpm acceptance-tests:preview:local`.

`API_URL=https://api.example.com pnpm acceptance-tests:preview:api` runs the locally built frontend against a separately running local or deployed API. Supply an HTTP(S) origin without credentials, paths, queries or fragments. Only Vite starts; its proxy forwards HTTP and WebSockets with the upstream Host and normal TLS verification. The external API stays running and failures never fall back to a local Worker. Extra Playwright arguments pass through both scripts.

The original `pnpm acceptance-tests:preview` selects external mode when `API_URL` is supplied, otherwise local mode. `PREVIEW_API_MODE=local|external` overrides that selection; the explicit scripts set it, and external mode requires `API_URL`. Ordinary `WEBAPP_URL=https://game.example.com pnpm acceptance-tests` still targets an already running complete application and starts neither server.

The separate `property-tests.yml` runs on main pushes/PRs, daily at 03:17 UTC and manually. It uses 1,000 cases per property for commit runs and 5,000 for scheduled/manual runs, with a positive-integer manual override. Each hosted property gets five minutes within the 20-minute job. All three package suites report independently and any failure makes the job red. Logs preserve fast-check seeds, paths and counterexamples for fourteen days. **Never add property tests to required release checks or make CI/deployment depend on them.** Preview acceptance keeps two retries. The known `ShootingAcrossLevels` flake is an Engine and Play follow-up.

The release job stays disabled until the owner sets `GUNSMITH_DEPLOY_ENABLED=true`. Enabled runs for the current `main` commit use Alchemy for the API Worker, D1 and Durable Object migrations. Wrangler deploys the tested artifact to the static webapp Worker. The release build requires the static-asset `noindex` rule. After the site reports the deployed SHA, the homepage returns `X-Robots-Tag: noindex` and the API answers the credentialed webapp origin and the D1 session lookup succeeds, four live Playwright shards run against the deployed URL and publish `playwright-live`. Main runs serialize through live acceptance. See [manual setup](../../MANUAL-SETUP-STEPS.md#first-deploy) for credentials, first deploy and rollback. The independent AI eval harness workflow runs the free full fake suite on relevant changes and preserves JSON summaries for fourteen days. It uses no secrets or model calls. Paid runs remain manual/local only; AI owns their selection, guard and evidence implementation. See [eval policy](EvalPolicy.md).

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

