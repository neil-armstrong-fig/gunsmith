# HANDOFF

How the three sessions work together without colliding. Read this at the start of every session, and update it when a
contract changes or a delivery lands.

## The personas

Start a session by clearing context and saying: **"You are build, continue the TODO."** (or `ai`, or `art`).

Read this current handoff and `TODO.md`, then your own current checklist.
Other checklists and archived deliveries are task references, not mandatory startup reading.
The canonical startup protocol is in `TODO.md`.

| Name    | Session           | Tool        | Owns                                                                                                                        | Does not touch                          |
| ------- | ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `build` | 1. Game / project | Claude Code | Everything until the contracts exist: scaffold, `shared/`, `engine/`, `webapp/`, `api/`, `acceptance-tests/`, `infra/`, CI, every `AGENTS.md` | Real LLM calls; art and sound files     |
| `ai`    | 2. AI             | Claude Code | `ai/`, its evals and datasets, AI parts of `api/` (credits, kill switch, gateway), LangSmith, budgets, `docs/ai-*.md`       | Engine rules; webapp screens; art       |
| `art`   | 3. Art and text   | Codex       | `TODO-art.md`, `webapp/public/assets/`, `webapp/audio/`, `docs/art/`, copy text, logo and icons, static sounds                                              | Anything under `src/`; schemas; configs |

Rules for all three: follow the startup protocol in `TODO.md`; stay in your own folders; tick off your own checklist as you
finish; ask before commits, dependencies, spending money or changing live infrastructure; never read secrets.

### Start prompts (paste after clearing context)

- **build:** "You are build. Follow the startup protocol in `TODO.md`, then continue the current resume section of `TODO-build.md`. Build a fun full-screen game first, acceptance-test first."
- **ai:** "You are ai. Follow the startup protocol in `TODO.md`, then continue the current resume section of `TODO-ai.md`. Read the AI package instructions and relevant design decisions before coding."
- **art:** "You are art. Follow the startup protocol in `TODO.md`, then continue the current work in `TODO-art.md`. Read the relevant art brief and audio instructions before changing their code or assets."

If the user runs two sessions in one checkout, or copies work between checkouts, follow the concurrency rules in
`AGENTS.md` and keep each persona's output inside its own paths so a copy-back is trivial.

## Contracts between sessions

These are what the other sessions plug into. **`build` introduces each contract test-first when a real consumer needs it.** Proposed rows below are not implemented contracts; see "What is ready". Changing one means editing this section in the same change and telling the user.

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
| Asset manifest | `webapp/src/assets/sprites/` (started 2026-11-16; the other families come as they are wired) | `build` (structure), `art` (fills files) | webapp, `art` | Stable key, size, format and a placeholder for every sprite, tile, icon and sound. **Live so far:** `sprite-player-stand-blue`, `sprite-player-crouch-blue`, `sprite-player-stand-orange` (files in `webapp/public/assets/sprites/<key>.svg`, a team's own file per stance, anchor (27, 32), body radius 18 px = the hitbox). A missing file shows the placeholder; `data-sprites-ready` says when all have loaded. |
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

## Authored weapon-parts experiment (2026-11-14)

Art supplies `docs/art/concepts/weapon-parts-kit-05/Parts.json`, twelve recipes and matching drawings.
Its `Assembly.md` defines the provisional attachment/size/mirroring interface and expansion conventions.
This is a proposed art-data interface for AI's kit probe, not a new production schema or renderer.
All twelve expanded drawings pass AI's current draft validator after temporary format conversion.
User visually approved the kit on 2026-11-14 (“looks really good”). Model selection/placement and
runtime performance remain unmeasured. Build/AI own
those implementations; art's README records unsupported identities and proposed handling.

## Folder ownership

| Path | Owner |
| ---- | ----- |
| `TODO-build.md`, `shared/`, `engine/`, `webapp/src/`, `api/` (except the AI parts), `acceptance-tests/`, `infra/`, `.github/workflows/ci.yml`, `property-tests.yml` | `build` |
| `TODO-ai.md`, `ai/`, `.github/workflows/evals.yml`, `api/src/ai/` (credits spend, gateway client, kill switch), `docs/ai-pipeline.md`, `docs/ai-hosting.md`, `docs/cost-and-budget.md` | `ai` |
| `TODO-art.md`, `webapp/public/assets/`, `webapp/audio/`, `docs/art/`, `docs/focused-case-study.md` (illustrations) | `art` |
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

- 2026-11-17, `build` (session 2, worktree `build-2-art`): **Art's designs wired in, slice 5: the shots, spec first and proved by mutation (10 of 10 killed), uncommitted for the user's review; the muzzle flash is descoped by the user.** `fx-projectile-rifle-blue` is art's `effects/projectile-rifle` copied unmodified to `webapp/public/assets/sprites/`; **`fx-projectile-rifle-orange` is a build stand-in (the same file with the fill `#FF9B54`) for the opponent's shots, because the user wants two shades: `art`, please draw the real one (request in `TODO.md`), keeping the 64 by 64 size, the scale and the tip at (49, 32)**, which the manifest anchors on the bullet's point. **Contract changes: `shared/`'s `BulletSnapshot` gained `shooter` and `directionDegrees` (the state hook only, used by `webapp/` and `acceptance-tests/`; none for `ai`/`art`).** **A bug fixed in `UseGameLoop.ts` (build 1 told): its `useFrame` now has priority -1, because it ran after the drawing components and everything was drawn one fixed step behind the world.** New acceptance seam, DSL only: `holdTheGame()` and `runGameFor()` (Playwright's fake clock), with `DrawingTheShots` (16 criteria). Main was 16 commits ahead and **not merged**: eleven of the files it changed are ones this slice edits uncommitted, so the merge waits for the user's commit.

- 2026-11-16, `build` (session 2, worktree `build-2-art`): **Art's designs wired in, slice 4 of 5: the practice dummies, spec first and proved by mutation (one survivor, below), uncommitted for the user's review.** Art's `dummy` is copied unmodified to `webapp/public/assets/sprites/sprite-dummy.svg` (one more live key for `art`: keep the centre (32, 32) and the 17-pixel body, which is the hit circle); the hurt-fade stays as a tint. **Contract change: none** (`shared/`, `engine/`, `ai/` untouched). Spec `DrawingTheDummies` (5 criteria); 3 of 4 browser mutants killed, **the survivor (an unseen dummy still drawn) is hidden by the vision veil, so the screen cannot tell.** **Slice 3, the held weapon, was tried and shelved at the user's word** (a muzzle will be hard to fit to generated weapons; revisit once feature complete); nothing of it is kept. `main` was merged into the branch first (`2d800c7`). Not done: shots and muzzle flash.

- 2026-11-16, `build` (session 2, worktree `build-2-art`): **Art's designs wired in, slice 2 of 5: the opponent, spec written first and watched red, proved by mutation, uncommitted for the user's review.** The opponent is drawn from art's `player-stand-orange` (copied unmodified to `webapp/public/assets/sprites/sprite-player-stand-orange.svg`; the user approved the copying of art's files for this lane), the same body and anchor as the player with two orange stripes, and only where the player's cone sees it (the whole group is hidden otherwise, so fog is unchanged).
  **Contract change: none** (`shared/`, `engine/`, `ai/` untouched). For `art`: one more live key (`sprite-player-stand-orange`; the opponent never crouches). Spec `DrawingTheOpponent` (6 criteria); `DrawingThePlayer` gained a hand-turns-with-the-aim criterion (13 now), since a round body hides rotation from colour counts. 7 browser mutants and 1 unit mutant killed. Not done: the held weapon, dummies, shots.

- 2026-11-16, `build` (session 2, worktree `build-2-art`; build 1 is the main checkout and build 3 does the reticle and the opponent on stairs): **Art's designs wired in, slice 1 of 5: the player's body, spec written first and watched red, proved by mutation, uncommitted for the user's review.** The player is drawn from art's `player-stand-blue` and `player-crouch-blue` SVGs (copied unmodified into `webapp/public/assets/sprites/<key>.svg`, **art's folder, at the user's word to implement art's designs**), through a new manifest (`webapp/src/assets/sprites/`: keys, size, anchor (27, 32), scale from `PLAYER_RADIUS`), a loader that draws each SVG four times its size onto a canvas texture, and `SpritePlane`
  (`toneMapped={false}`: the scene tone-maps and paled the old disc). The old disc and barrel stay as the placeholder until a picture has loaded or if its file is missing; **`data-sprites-ready`** on the arena says when all have, and the acceptance DSL waits for it. The drawing shrinks when crouched; the hitbox does not. **Contract change: none for `shared/`, `engine/`, `ai/`.** For `art`: the manifest and keys above (see `TODO.md` blockers). Spec `DrawingThePlayer` (9 criteria, screenshot-read); root `pnpm checks` exit 0, 146 of 146 specs on a production build, 570 of 570 at `--repeat-each=10` for the player, vision and HUD specs, 13 unit and 7 browser mutants killed. `pnpm test:properties` does not exist yet. Not done: the opponent, the held weapon, dummies, shots (`TODO-build.md`, "Build 2").

- 2026-11-16, `build`: **Weapon pickups, slice 1, and the audio tests moved to vitest, uncommitted for the user's review.** *Pickups* (spec first, red for the right reason, then engine unit tests first): `engine/src/pickup/` (`StartPickup`, `TakePickup`, `placement/`, `taking/`), `World.pickup?`, one call at the end of `step`, `weapon/weapons/SubmachineGun` (a placeholder weapon neither fighter starts with), `VisibleToPlayer.pickup`. One weapon lies in the duel and in sparring each round, as near as can be to equally far from both starts by walking distance, drawn from the seed on its own stream; walking onto it (0.5 tile) equips it in slot 2 (as the user chose; the replaced weapon is thrown away, not left on the floor), for the player or the opponent by the same rule. **Contract change (`shared/`): the state hook gained an optional `pickup {x, y, visible, magazineSize, startingReserve}` (`PickupSnapshot`), used by `webapp/` and `acceptance-tests/`. For `ai`/`art`: none** (`ai/` imports none of it; manifest key: none, the disc is a plain placeholder colour in `three/.../pickup/Pickup.tsx`, one swap when `art`'s pickup glow has a key). Measured before building: against an idle player the duel bot never came within the pickup's reach on seeds 2, 3, 4, 6, 12 and 19 (nearest 1.04 tiles) or on 40 survey seeds, so no pinned seed moved and no query gate was needed. Specs `PickingUpAWeapon` and `APickupEachRound` (the walk onto it, the same seed the same place, the seed picks the row, it is gone once taken, seen only in the cone, a new place next round, none in the practice range or heights arena). Not done: the bot seeking pickups (build 3's), weapon variety, a dropped weapon on the floor, `pnpm test:properties` (does not exist). *Audio:* `art`'s uncommitted `damage/` and `studies/` code was cleaned up at the user's word (output byte for byte the same, a test that pins it), and **all 64 `webapp/audio` test files now run on vitest** (the package gained `vitest: catalog:` and a `vitest.config.ts`; `test` is `vitest run`; two `node:assert` users that are not tests, `browser/controls/` and `encoding/fixture/SourceOfOneEffect`, stay). `test:render` passes under vitest (562 s).

- 2026-11-16, `build/tooling`, at the user's request: hardened instruction delivery and standards enforcement across packages. Global Codex instruction budget is 65536 bytes, model settings unchanged. Startup guidance now points to current status, own checklist and explicitly read package instructions; historical narratives are preserved in `docs/history/`, operations in `docs/agent-reference/`. Local ESLint rules are strict TypeScript and checked by shared's compiler; regression fixtures exercise actual package overrides. Added import spacing and property shorthand enforcement. Extracted object shapes are multiline interfaces in owning types folders; HeightTiles' supporting interfaces share its adjacent types/ folder. Scoped Step's fixture-specific helpers into four describes (95 tests preserved). No game rule, schema shape, audio recipe or asset changed. Tooling tests: 18 pass; root checks passed before the final TypeScript conversion and are being rerun. Audio preservation passed (344.11 s), with a final run after shorthand changes in progress. Full acceptance: 148 passed, 12 pickup criteria failed because this checkout has pickup specs but no pickup runtime. Fake evals: 116 passed, 8 failed; the unchanged fake moderator always answers weapon request, so negative-request criteria fail. Property-test command is not implemented. No paid model call, dependency, commit, push or index write by this session. Folder/caller review completed; single-caller drawing constants moved below their reader. Final gate results follow after the current runs.

Historical deliveries: [delivery archive](docs/history/HandoffDeliveries.md).
