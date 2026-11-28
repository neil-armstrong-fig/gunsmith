---
name: bump-dependencies
description: Audit Gunsmith's exact-pinned catalog dependencies against the seven-day release-age policy, then bump them in groups with the right checks for each. Use when the user asks whether libraries are out of date, asks for a dependency audit or bump, or a gap since the last commit calls for the catalog check in root AGENTS.md.
---

# Bump dependencies

Every external dependency is exact-pinned once in the `catalog:` of `pnpm-workspace.yaml`; packages say `catalog:`. The
supply-chain policy there (`minimumReleaseAge`, strict) refuses any release younger than seven days, `trustPolicy: no-downgrade`
refuses a release with weaker provenance than earlier ones, and `strictDepBuilds` fails on an install script nobody reviewed.

**An audit is free; a bump needs the user's go-ahead** (root `AGENTS.md`, "Ask before"). If the user asked only whether things are
out of date, stop after step 3 and propose. If they said to make the updates, do steps 4 to 6 for the groups they chose.

## Steps

1. **Preflight.** `git status --short`: note uncommitted work that is not yours (other sessions share the tree). Bumps rewrite
   `pnpm-lock.yaml` and `pnpm-workspace.yaml`, so say so if another session's work is in flight there. Never delete or rebuild
   the lockfile.
2. **Audit.** From the repository root: `node .agents/skills/bump-dependencies/EligibleVersions.mjs`. It lists each package
   that is behind: the current pin, the newest **eligible** release (old enough, not deprecated, with any deprecated release it
   passed over), the newest stable release (which may still be inside the window), and which packages use it.
3. **Classify and report.** Read the catalog comment above each pin and the version gotchas in
   `docs/agent-reference/Operations.md`, then sort every row into one of these:
   - **Held on purpose:** say why and whether the reason still holds. Re-check it: TypeScript stays at 6.0.x until
     `pnpm view typescript-eslint@<eligible> peerDependencies` allows the next version. alchemy stays at 0.94 while
     its only newer releases are `2.0.0-beta` versions.
   - **Groups that move together:** check peer ranges with `pnpm view <pkg>@<version> peerDependencies`.
     - LangChain (`ai`): `@langchain/core`, `@langchain/langgraph`, `@langchain/langgraph-cli` (the local Agent Server for
       Studio), `@langchain/anthropic`, `@langchain/ollama`, `langsmith`. anthropic's range on core usually decides the floor.
     - Lint and format: `eslint`, `typescript-eslint`, `@eslint-react/eslint-plugin`, `prettier`.
     - Web build: `vite`, `@vitejs/plugin-react`, `vitest`, `tailwindcss` with `@tailwindcss/vite` (same version).
     - Worker: `wrangler` with `@cloudflare/workers-types` (wrangler's peer range names the minimum), `drizzle-orm`, `oauth4webapi`.
     - Browser and state: `@playwright/test`; `zustand` must stay inside react-three-fiber's own `zustand` range, so the two share one copy.
   - **Major versions and 0.x minor versions:** propose each one alone, with a link to its changelog. Never fold one into a group.
   - **Inside the window:** name them and say when they become eligible.

   Report it as tables: held (with the reason), proposed groups, and not yet eligible.
4. **Apply one group at a time.** Change only the version on each catalog line, keeping exact pins, never ranges. Rewrite or delete
   any comment that cites the old version or an old window ("1.65.0 is under seven days old"). Then `pnpm install` and
   `pnpm peers check`, and compare the peer warnings with the ones before (`ai`'s `@hono/node-server` and `typescript`,
   from `@langchain/langgraph-api`, are known).
   - A `trustPolicy` refusal on a new transitive dependency, or a `strictDepBuilds` failure, needs review. Read the package
     (maintainers, install script, dependencies, advisories) and propose a `trustPolicyExclude` or `allowBuilds` entry at that
     exact version, with a comment like the `chokidar@4.0.3` one. The user decides.
5. **Verify each group before the next.**

   | Group | Checks |
   | --- | --- |
   | LangChain | `pnpm --filter @gunsmith/ai checks`, `pnpm --filter @gunsmith/api checks`, `pnpm evals:fake` in `ai/`; then `pnpm dev --port 2077` in `ai/` and run both Studio graphs (below) |
   | Lint and format | `pnpm checks`. **If a Prettier minor reformats files, stop and ask**: a repo-wide `pnpm format` would rewrite other sessions' files |
   | Web build, browser and state, Worker | `pnpm checks`, then `pnpm --filter @gunsmith/acceptance-tests exec playwright install chromium` after a Playwright bump, then `pnpm acceptance-tests:preview:local --workers=3` (run it in the background: it builds the frontend and a local Worker, as CI does) |

   If a few acceptance specs fail in the full run, rerun just their files
   (`PREVIEW_API_MODE=local pnpm acceptance-tests:preview <spec files> --workers=3`) before blaming the bump. A timing-sensitive
   spec (a clock that must have moved, a shelf that must have loaded) can fail under the load of a 14-minute run. Report both results.

   Never run `evals:local` or `evals:paid` for a bump without asking: local is slow, and paid spends from the ledger.
   To smoke-test the Studio graphs, use the dev server, which listens on IPv6 `[::1]`, not `127.0.0.1`:

   ```sh
   curl -sg -X POST 'http://[::1]:2077/runs/wait' -H 'content-type: application/json' \
     -d '{"assistant_id":"weaponSmith","input":{"prompt":"a mild rifle"}}'
   ```

   Expect 9 steps and 3 model calls for `weaponSmith`, and 4 steps and 2 calls for `arenaSmith`. The CLI's warning that
   `@langchain/langgraph-checkpoint` is at `0.0.0` is a version-detection quirk (1.2.x is installed).
6. **Finish.** Re-run the audit script: only held and not-yet-eligible rows should remain. If you re-checked a hold, update its
   date in the catalog comment and in `Operations.md`. Report what was bumped (old to new), what is held and why, what waits for
   the window, the checks you ran with their real results, and any new peer warnings. Suggest a commit message such as
   `chore(deps): bump LangChain group, tooling and Playwright`. Do not commit.
