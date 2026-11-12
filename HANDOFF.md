# HANDOFF

How the three sessions work together without colliding. Read this at the start of every session, and update it when a
contract changes or a delivery lands.

## The personas

Start a session by clearing context and saying: **"You are build, continue the TODO."** (or `ai`, or `art`).

**Every fresh session reads all of this file, `TODO.md` (the shared north-star path and status board) and all three persona
checklists (`TODO-build.md`, `TODO-ai.md`, `TODO-art.md`),** so each persona knows what the other two are doing, waiting
on or blocking. Then it says so in a few lines before starting (the sync protocol is at the top of `TODO.md`).

| Name    | Session           | Tool        | Owns                                                                                                                        | Does not touch                          |
| ------- | ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `build` | 1. Game / project | Claude Code | Everything until the contracts exist: scaffold, `shared/`, `engine/`, `webapp/`, `api/`, `acceptance-tests/`, `infra/`, CI, every `AGENTS.md` | Real LLM calls; art and sound files     |
| `ai`    | 2. AI             | Claude Code | `ai/`, its evals and datasets, AI parts of `api/` (credits, kill switch, gateway), LangSmith, budgets, `docs/ai-*.md`       | Engine rules; webapp screens; art       |
| `art`   | 3. Art and text   | Codex       | `TODO-art.md`, `webapp/public/assets/`, `docs/art/`, copy text, logo and icons, static sounds                                              | Anything under `src/`; schemas; configs |

Rules for all three: read `AGENTS.md`, this file, `TODO.md` and all three persona checklists first; stay in your own folders; tick off your own checklist as you
finish; ask before commits, dependencies, spending money or changing live infrastructure; never read secrets.

### Start prompts (paste after clearing context)

- **build:** "You are build. Read `AGENTS.md`, `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md`, `TODO-art.md` and
  `docs/fuzzy-frontend.md` in the gunsmith repo, say what the other two personas are up to, then continue `TODO-build.md`
  from the first unchecked item. The fuzzy frontend comes first: get a clickable whole game
  fast, then bring each area into focus test-first. Tick items off in `TODO-build.md` as you finish them, update your row in `TODO.md`, and update
  `HANDOFF.md` whenever a contract that `ai` or `art` plugs into changes. Ask before committing."
- **ai:** "You are ai. Read `AGENTS.md`, `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`,
  `docs/ai-pipeline.md`, `docs/ai-hosting.md` and `docs/cost-and-budget.md`, say what the other two personas are up to,
  then continue `TODO-ai.md` from the first unchecked item. Start with the costed hosting
  comparison. Use only the contracts below (the zod schemas and `AiAdapter`), never change `engine/` rules, and keep
  evals out of `pnpm checks`. Tick items off in `TODO-ai.md` and update your row in `TODO.md`. Ask before anything that spends money."
- **art:** "You are art. Read `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`, `docs/art/README.md`,
  `docs/art/asset-manifest.md`, `docs/art/copy.md` and `docs/art/audio.md`, say what the other two personas are up to,
  then continue `TODO-art.md`. Write only under the asset folders named below, follow the
  manifest's keys, sizes and formats exactly, use the flat-vector neon geometric palette, and list what you delivered in
  the delivery log at the bottom of this file and tick `TODO-art.md`."

If the user runs two sessions in one checkout, or copies work between checkouts, follow the concurrency rules in
`AGENTS.md` and keep each persona's output inside its own paths so a copy-back is trivial.

## Contracts between sessions

These are what the other sessions plug into. **`build` creates them first (during the fuzzy frontend, shaped as the real
thing).** Changing one means editing this section in the same change and telling the user.

| Contract | Lives in | Who owns it | Used by | Notes |
| -------- | -------- | ----------- | ------- | ----- |
| Weapon and arena zod schemas | `shared/` (draft in `docs/schemas.md`) | `build` | everyone | Includes the weapon's `sound` block. The hard caps are enforced in `engine/`, not in the schema alone. |
| Fixture weapons and arenas | `shared/` | `build` | `ai`, tests | Valid, over-powered, boundary and invalid examples. `ai` seeds its datasets from them. |
| `AiAdapter` interface | `shared/` | `build` (shape), `ai` (real implementation) | webapp, api, tests | Generate a weapon, generate an arena, judge two arena prompts, report pipeline-progress events, return the credit cost. Failures are typed (rejected, timed out, AI off). A **fake adapter** returns fixtures with simulated delay and failures. No acceptance test calls a real one. |
| `CreditLedger` interface | `shared/` | `build` | api, `ai` | Balance, atomic spend, refund, daily reset at 00:00 UTC. An in-memory fake and a D1 implementation pass the same contract suite. |
| Credit prices and limits | one config in `shared/` | `build` | `ai`, webapp | 10 a day; weapon 1, arena 1, edit 1, rejection 0.5. Prompt token limits: weapon 150, arena 250. |
| Kill-switch flag | `api/` (KV or D1) read through one function | `ai` (writes), `build` (reads in UI) | webapp, api | When on: no new generation, the AI-off banner, built-in pool only, game still plays. |
| Power rating and caps | `engine/` | `build` | `ai`, webapp | The `rate` node in the AI graph calls it. The AI never decides balance. |
| Arena validator | `engine/` | `build` | `ai`, webapp | The `validate` node calls it. |
| Output moderation (names, descriptions) | `engine/` or `shared/` | `build` | `ai` | Deterministic blocklist and length/charset limits. |
| Canvas state hook | `webapp/` | `build` | acceptance DSL | A read-only, tiny object on `window` exposing what specs need (player positions, health, round, visible entities). Not for writing state. |
| Asset manifest | `webapp/src/assets/manifest` | `build` (structure), `art` (fills files) | webapp, `art` | Stable key, size, format and a placeholder for every sprite, tile, icon and sound. |
| Wire messages | `shared/` | `build` | webapp, api | Client inputs and fog-filtered server snapshots (`docs/match-netcode.md`). |
| AI in the Worker (decided 2026-11-12) | `ai/` | `ai` | api | The pipeline runs inside the Worker (`docs/ai-hosting.md`, option 3), so `api/` imports `@gunsmith/ai` and calls the real `AiAdapter` in-process; no HTTP client in `shared/` is needed. `ai/` must stay Workers-safe. The fake adapter still comes first. |

## User-directed mechanics revision (2026-11-12)

This supersedes the original radius-vision and walkable-ramp assumptions. `art` updates the concepts and shared design
notes; `build` and `ai` must carry these changes into their owned schemas, fixtures, engine, renderer and generation.

- Height changes only at explicit **stairs**, with a visible flight/landing on each of the two connected levels.
  Other height boundaries are impassable. The validator must check routes through stairs. Replace the provisional
  ramp contract with paired stair endpoints; agree the exact manifest keys at M2. No production key is added by art.
- No `L1` / `L2` / `L3` text on the arena in play; floor tone, edge ticks and stairs explain height.
- **Confirmed vision model:** terrain remains dimly visible outside the cone; it is not opaque darkness. A forward
  cone follows aim through a full 360° turn, revealing terrain detail and players/items in its current area, subject
  to walls and height. The equipped **weapon** defines the base cone (configured by its prompt); standing/crouching
  modifies it. Crouch increases range as agreed. Filter dynamic entities on the server; dim known terrain is separate
  from revealing players/items. Cone ownership is settled; only omitted-stat policy remains pending.
- **Crouch increases forward vision range** rather than removing vision. Keep the cone's angle, aim direction and
  wall/height occlusion unchanged. The size of the range bonus is a build-owned tunable, not the illustrative ratio
  in the art sheet. Apply the same rule on the server and client.
- **Art must remain prompt-malleable:** weapon identities, silhouettes, proportions, decorations and effects may vary
  with validated generated descriptions. Behaviour classes are a vocabulary, not a fixed sprite catalogue. Build/AI
  should agree a bounded visual-description contract at M2; current weapon schemas have no visual-part fields.
  Keep generated visuals separate from hitboxes, damage rules, visibility and audio limits. Art's oddities sheet is
  an exploration, not evidence that arbitrary new mechanics are supported.
- Unspecified prompt details must still produce complete, usable results. The user is considering modest defaults
  versus letting the AI choose weaknesses in unspecified weapon fields; policy is awaiting their answer.
  Art recommends deterministic modest defaults with generated values visible at reveal. Exact numbers and cone caps
  belong to build/AI and must be settled together before implementation, not invented by the art concept.

## Research feedback from the user (2026-11-12)

- **Crouch:** substantially slows movement, making the player easier to hit. This is the intended tradeoff for longer
  vision, quieter movement and cover protection. Tune the slowdown through play; do not invent another penalty first.
- **Arena creation:** after the player/AI definitions are resolved, code finalises and validates geometry, stair routes,
  spawn/pickup access and ring escape. Apply the same fairness checks to built-in arenas, which also need deliberate
  authoring and playtesting. Generated content is not an excuse for lower quality; built-ins are the reference set.
- **Pickup proposal:** test weighting the strongest-rated weapon towards contested central space. This interprets
  “winning weapon” as highest power rating, not a new weapon-judging stage. It is weighted placement, not a fixed spawn
  or guaranteed pickup. Central means accessible by fair routes through stairs, not merely the geometric midpoint.
- **Fog clarification (corrected):** this is a dim map with a rotating detailed view, determined by equipped weapon
  and stance. Turning sweeps the cone over terrain and reveals players/items in it. Test both terrain detail and
  entity visibility, rather than describing the mechanic only as opponents appearing/disappearing. Outside-cone
  terrain remains visible at low detail; hidden players/items and their exact-position effects do not.

## Submitted visual-schema proposal (2026-11-12)

The user authorises design-time schema/renderer changes; generated weapons must never change code at runtime.
`art` submitted `docs/art/visual-schema-proposal.md`: a versioned optional appearance block, bounded primitive unions,
known effect/animation presets, palette roles, fixed anchors and one reusable renderer. It includes six fixture targets,
legacy fallback, initial budgets to measure and build/AI/art acceptance criteria. This is an M2 proposal, not a frozen
interface. Build implements the schema and renderer; AI reviews generation/eval cost; art supplies top-down QA.

## Folder ownership

| Path | Owner |
| ---- | ----- |
| `TODO-build.md`, `shared/`, `engine/`, `webapp/src/`, `api/` (except the AI parts), `acceptance-tests/`, `infra/`, `.github/workflows/ci.yml`, `property-tests.yml` | `build` |
| `TODO-ai.md`, `ai/`, `.github/workflows/evals.yml`, `api/src/ai/` (credits spend, gateway client, kill switch), `docs/ai-pipeline.md`, `docs/ai-hosting.md`, `docs/cost-and-budget.md` | `ai` |
| `TODO-art.md`, `webapp/public/assets/`, `docs/art/`, `docs/focused-case-study.md` (illustrations) | `art` |
| `AGENTS.md`, `TODO.md` (shared path), `HANDOFF.md`, `MANUAL-SETUP-STEPS.md`, other `docs/` | whoever changes the thing the doc describes; say so in your summary |

## What is ready for the others

`build` updates this list. `ai` and `art` start from the first row that is true.

- [ ] A fun, playable game first (full-screen canvas, built test-first; `TODO-build.md`). Menus are added around it afterwards
- [ ] Weapon and arena schemas and fixtures in `shared/`. **Withdrawn 2026-11-12:** deleted, to return test-first when a second package needs them
- [ ] `AiAdapter`, `CreditLedger` interfaces and their fakes. **Withdrawn 2026-11-12:** deleted with the fake world; they return when the game is fun and the AI is next
- [ ] Asset manifest with placeholders and `docs/art/` stubs complete
- [ ] Power rating, caps and the arena validator in `engine/`
- [ ] Real `AiAdapter` swapped in behind the same interface (`ai`)
- [ ] Art delivered and wired in (`art`, then `build`)

## Delivery log

Newest first. One line each: date, who, what, where.

- 2026-11-12, `build`: **Practice dummies, test first.** Three dummies stand in the practice arena; a bullet that reaches
  one hurts it (100 health, 25 a bullet) and enough bullets remove it. `engine/` gains `dummy/` (`HurtDummies`, health and
  radius tunables), `bullet/hit/` (an exact ray-against-circle test, so a graze is not missed) and `weapon/damage/`;
  `advanceBullets` now takes the dummies and returns a `BulletFlight` (a bullet is gone at the nearer of a wall and a dummy).
  The state hook's snapshot (`shared/src/state-hook/types/`) gained `dummies` (`x`, `y`, `health`). New DSL: `gunsmith.dummies`
  and `player.startFiring`/`stopFiring`; new spec `ShootingADummy.test.ts`. 117 engine and 40 webapp unit tests and 27
  acceptance specs, all mutation-proved; `pnpm checks` green. The acceptance DSL's `*Playwright` classes now read and wait
  on the game through two `BasePage` helpers (`readGameState`, `waitForGameState`), and `FiringAShot` asserts the bullet
  count after its wait. Nothing for `ai` or `art` to wire; no contract changed (the dummy is the only new sprite-to-be: a
  disc, no manifest key yet).

- 2026-11-12, `build`: **Housekeeping after the first commit.** Renamed the engine's `simulation/` to `game-loop/` and the
  webapp hook to `useGameLoop` (the engine holds one turn of the loop, `step`; the caller runs it at a fixed rate). Swept
  every package for the folder rule and moved single-caller files beneath their callers (the webapp's `game/` folder is
  gone; the acceptance DSL's base files now live in `dsl/gunsmith/`). `AGENTS.md` status note updated (four of seven
  packages exist). `TODO-build.md` now opens Phase 1 with where things stand, how to run the specs, gotchas and the next
  step (practice dummies and damage). No contract changed; nothing for `ai` or `art` to wire.

- 2026-11-12, `build`: **Aiming and shooting, first pass, test first.** `engine/` gains `player/AimPlayer`, `bullet/`
  (`FireBullet`, `AdvanceBullets`: flying bullets that die on walls) and `weapon/TriggerPull` (steady fire rate); `Input`
  now carries `aimAt` and `firing`. The state hook's snapshot (`shared/src/state-hook/types/`) gained `aimDegrees` and
  `bullets`. New specs: aiming at the mouse in six directions, a click fires a bullet each way, a bullet is gone at the
  wall. Folders now follow one rule (types in `<domain>/types/`, entry points at the top, one-caller helpers in a subject
  subfolder; written in `AGENTS.md` Code style). Nothing for `ai` or `art` to wire.

- 2026-11-12, `art`: user clarified the vision model: dim terrain outside the cone; detailed terrain and entities
  inside; equipped weapon and stance configure it; aim rotates it through 360°. Corrected active design/netcode/art
  guidance, build TODO and stale cone-ownership blockers; revised industrial-arena SVG/PNG. No runtime edits.
  Visual/XML checks and `pnpm checks` pass (51 unit tests); no browser gameplay acceptance run for this art/docs change.
- 2026-11-12, `build`: **First two specs, test first.** New packages `acceptance-tests/` (janggi's three-layer DSL shape,
  desktop only, `@playwright/test` 1.64.0) and `engine/` (deterministic: `arenaFrom`, `isSolid`, circle-vs-grid
  `pushOutOfWalls`, `step`; 33 unit tests, mutation-proved). Specs: the arena fills the window; WASD walks four ways, a
  wall stops the player, releasing stops them. The one thing in `shared/` is the state hook's snapshot type, which
  `webapp` writes and the specs read (`shared/src/state-hook/`). Nothing for `ai` or `art` to wire yet; contracts remain
  withdrawn. `pnpm checks` green.

- 2026-11-12, `art`: recorded user research feedback in shared design/netcode notes, art guide, research brief and
  build/AI follow-up: substantial crouch slowdown; deterministic arena fairness after definitions with curated built-ins;
  proposed central weighting of the strongest weapon; fog means the current view as you look around. No runtime changes.
- 2026-11-12, `art`: sourced game-session brief in `docs/art/gameplay-research.md` (ROUNDS, Shotgun Farmers, Noita,
  Due Process, Heat Signature; Red Blob/Riot visibility; Tanagra). Added five playtest setups to Phase 1's research
  follow-up in `TODO-build.md`, and clarified that full cone/height visibility is not symmetric. Research hypotheses,
  not approved new mechanics. Contracts remain withdrawn until needed. No runtime changes or manifest keys.
  `pnpm checks` passes (6 unit tests); browser acceptance specs not run for documentation.
- 2026-11-12, `build`: **Direction change, at the user's request: the game first, test-first; the contracts are withdrawn.**
  The user looked at the fuzzy frontend and wanted the game to fill the whole screen with menus appearing only when
  needed, development slowed to ATDD, and nothing in `shared/` until two packages need it. Deleted: the whole fuzzy
  frontend (menus, step jumper, fake `AiAdapter` and `CreditLedger`, flow and library slices, stand-in power rating) and all
  of `shared/src` (weapon and arena zod schemas and fixtures, `AiAdapter`, `CreditLedger`, credit config, library limits).
  `shared/` is back to tool config. **For `ai` and `art`: do not build against `shared/src`; the M2 review requests are
  withdrawn and M2 is un-frozen.** The schemas return, test-first, when the game and the AI need the same shape, and `build`
  will say so here first. `ai`'s worktree never imported them, so nothing there breaks. Next: `acceptance-tests/` and
  `engine/` packages, then a full-screen practice arena, one spec per mechanic.

- 2026-11-12, `art`: submitted `docs/art/visual-schema-proposal.md` and added implementation/review items to the build, AI and art TODOs at the user’s request. No runtime/schema changes; proposal for one fixed renderer driven by strict appearance JSON. Submission JSON/link checks and `pnpm checks` pass (131 tests). Manifest keys: none.
- 2026-11-12, `build`: **Contracts drafted for M2 review, and the pre-round flow clickable.** `shared/`: weapon and arena zod
  schemas (`weapons/Weapon.ts`, `arenas/Arena.ts`) with one limits table each (`WeaponLimits.ts`, `ArenaLimits.ts`,
  `sound/WeaponSoundLimits.ts`), valid, boundary and invalid fixtures (`*/fixtures/`), `credits/CreditConfig.ts`,
  `CreditLedger`, `ai/AiAdapter.ts` with typed results and failures (`ai/results/`), `library/LibraryLimits.ts`,
  `ai/EstimateTokens.ts`. `webapp/`: one-page layout (rail, stage, side panel), the backtick step jumper (all 15 screens,
  11 awkward states), the fake `AiAdapter` and `CreditLedger`, the whole pre-round through reveal and a best-of-three with
  stand-in round buttons. 131 unit tests; `pnpm checks` green. **Asks of `ai`:** review `AiAdapter`, `RejectionReason` (a
  draft list), the `PipelineStep` list and the `AiResult.creditCost` convention (rejection 0.5, timeout and AI off 0, the
  caller charges up front and refunds the difference). **Asks of `art`:** (1) arenas use one `r` tile for a ramp up to the
  same cell on the next level, not your paired stair endpoints: say if the pair is needed in the data; (2) weapons have no
  visual-description fields yet: `build` and `ai` need your bounded vocabulary before one is added; (3) the palette
  tokens are live in `webapp/src/index.css` as `--color-gs-*`. **Open for the user** (from `art`'s notes, not decided
  here): forward vision cone versus 360°, and modest defaults versus AI-chosen weaknesses; the engine waits on both.

- 2026-11-12, `art`: longer crouch cone in industrial-arena SVG/PNG; six prompt-built oddities with two variants each in `docs/art/concepts/prompt-built-oddities.png`, prompts/interpretations in its sibling Markdown, and flexible visual grammar in the art guide. Shared design/netcode notes updated. Visual/XML QA and typecheck pass, 99 tests pass; combined checks stop on a build-owned webapp test lint error. Manifest keys: none (concepts).
- 2026-11-12, `art`: revised SVG/PNG and style guide for paired stairs, no in-arena level labels and forward-cone vision; updated shared game-design/netcode notes and recorded build/AI contract follow-up above. No runtime or schema edits. Visual/XML checks pass; lint and 57 tests pass; typecheck fails on missing test globals in shared, combined checks also report shared formatting failures. Manifest keys delivered: none.
- 2026-11-12, `art`: A1 industrial arena style guide and proposed palette in `docs/art/README.md`; original editable `docs/art/concepts/industrial-arena.svg` and PNG preview. XML/reference checks and colour/grayscale visual review passed; `pnpm checks` passed (8 tests) with installed Node 26.13.0. Manifest keys delivered: none (concept only); M2 review and A2–A4 await build’s manifest.
- 2026-11-12, `build`: Phase 0 scaffold. pnpm workspace with `shared/` (tool config only) and `webapp/` (Vite, React 19,
  Tailwind v4, Redux Toolkit, react-three-fiber; a top-down canvas with a WASD-moved square). No contract changed and
  nothing for `ai` or `art` to wire yet. Note for `ai`: dependencies are exact-pinned in `pnpm-workspace.yaml`'s `catalog:`.
- 2026-11-12, `ai`: O1 desk research. Hosting comparison and a **provisional** recommendation (option 1) in
  `docs/ai-hosting.md`; budget arithmetic and fixed-spend figures in `docs/cost-and-budget.md`. Nothing deployed, no
  dependencies installed, nothing spent. Option 2 forces Workers Paid (see `TODO.md` blockers).
- 2026-11-12, `ai`: O1 closed on the user's decisions. **Hosting: option 3, the pipeline inside the Worker** (Plus declined);
  `api/` will import `ai/` (`AGENTS.md` table updated, `HANDOFF.md` contract row replaced). Budget: $1 a day with the $20
  month as the hard cap, early shutdown accepted (`docs/cost-and-budget.md`). The proof package `ai/` is on the **uncommitted
  worktree** `.claude/worktrees/ai-hosting-proof` (branch `worktree-ai-hosting-proof`), not in main: `pnpm checks` exits 0
  there, `langgraph dev` serves the graph, and the graph runs in workerd (2.79 MiB bundle, 2 to 4 ms per request). It also
  carries `trustPolicyExclude: chokidar@4.0.3` and `workerd: false` in its `pnpm-workspace.yaml`. Waiting for the user's review
  before anything merges into main; `build` will be told before it does. No money spent, no model called, nothing deployed.
- 2026-11-12, `ai`: **main merged into the `ai/` worktree and `ai/` fitted to `engine/`'s conventions** (self-named imports and an
  `exports` map so `api/` can import it as raw source, types in `types/`, doc comments). Root `pnpm checks` exits 0 there. For
  `build`: when `ai/` merges, `pnpm-workspace.yaml` gains `ai` in `packages` and the catalog entries for LangChain, LangGraph,
  `langsmith`, `wrangler` (the one `zod` entry stays), plus `trustPolicyExclude: chokidar@4.0.3` and `allowBuilds: workerd: false`.
  The AI code is left **uncommitted** for the user's review in VS Code (two branch commits exist, to be undone).
- 2026-11-12, `ai`: **eval-driven development set up** in the `ai/` worktree (not merged): `evals/` harness with five
  deterministic evaluators, nine weapon cases, three model tiers (fake, local Ollama, capped paid), the first red-green (token
  pre-check), `ai/AGENTS.md`. Adds two dev dependencies (`@langchain/ollama`, `langsmith`) to the worktree's catalog, which will
  touch `build`'s `pnpm-workspace.yaml` and lockfile when merged. Schemas and caps in `ai/` are **drafts** until `build`'s
  contracts land; nothing in `shared/`. Waiting on the user to install Ollama before the local loop.
- 2026-11-12, `ai`: checked trace flush and Studio (`docs/ai-hosting.md`). **Rule for `api/` when it calls `ai/`: flush
  LangSmith traces with `ctx.waitUntil(awaitAllCallbacks())` on every request path, errors included**: an unflushed trace is
  lost and the orphaned batch can hang the next request. Tracing variables are read from bindings with
  `nodejs_compat_populate_process_env`. Studio: server side verified; the UI needs a signed-in LangSmith account, so the
  user opens it once (`localhost`, not `127.0.0.1`). Tested against a local fake LangSmith endpoint, not a real account.
