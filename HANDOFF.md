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
| `art`   | 3. Art and text   | Codex       | `TODO-art.md`, `webapp/public/assets/`, `webapp/audio/`, `docs/art/`, copy text, logo and icons, static sounds                                              | Anything under `src/`; schemas; configs |

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

- 2026-11-14, `ai`: main merged into the `ai` worktree (fast-forward to `ceb5063`). The jellyfish lantern drawing, red first on Haiku 5.5: the overflow
  sentence now names the shape's kind and how far to pull it in (`ai/` only; no contract, `shared/` or `engine/` change). 0 stand-ins in 31 jellyfish trials
  (was 3 in 9) and 35 of 36 valid first time over the full set, but the first draft moved too, so the sentence's own effect is unproven
  (`docs/ai-visual-generation.md`, "The jellyfish lantern"). Spend $0.458 of the $1. Uncommitted in the worktree for the user. Nothing new needed from `build` or `art`.
- 2026-11-14, `art`: removed the one-off alignment runner, comparison helper,
  types and nine tests at the user's request. Frozen evidence/build handoff and
  existing codec QA retained; reproduction notes and historical source hashes
  updated. No audio, runtime, dependency or manifest change. Root pnpm checks
  passes (lint, formatting, strict types and tests); audio 254 pass, one slow
  render skipped. Evidence/audio hashes and folder/caller review pass.

- 2026-11-14, `art`: **WebKit alignment diagnosis delivered**, under
  `webapp/audio/qa/webkit-alignment/`: 76 browser/file rows, native/browser QA,
  preservation hashes and an owned-playback handoff for build. Nine signal tests;
  offset/overlap/combined-ambiguity mutation probes killed. Informative windows
  show −128 in 15 Vorbis files and +576 in 11 MP3 files; ambiguous windows remain
  inconclusive. Native/Chromium 38/38, WebKit 23 failures retained. No master,
  export, runtime, format, dependency or model-call change. Manifest keys: none.
  Final root checks pass (630 engine, 419 AI, 160 webapp, 263 audio; one slow
  render skipped). Folder/caller and standards audit completed. No gameplay
  acceptance or model eval run for the offline diagnostic.

- 2026-11-14, `ai`: **Kit-of-parts selection probe done and the code removed again** (art's kit 05; the user judged the shapes arm far
  better and asked for the kit code to go, with a note to rebuild from: `docs/ai-visual-generation.md`, "How the kit arm worked").
  Main merged into the `ai` worktree first (a fast-forward to `f456130`). **Findings for `art` and `build` (Haiku 5.5, 11 requests x 3
  trials, $0.031):** valid drawings were clean (teapot, jellyfish, bubblegum mortar, plain gun) but only 12 of 33 were valid first time,
  5 repaired, 16 stand-ins; the shapes arm on the same prompts is 32 / 2 / 2 of 36. Every first refusal (21 of 21) was parts running
  **past the right edge** (the model cannot add up chained parts); the duck and fax never reached the canvas. Nothing was changed in
  `art`'s files; art's expansion rules, 12 recipes and 9 faulty recipes held up as an oracle. The call budget question for `build` is
  unchanged.
- 2026-11-14, `build`: **Crouch (slice 2), test first, and the `ai` worktree merged.** Merged `worktree-ai-hosting-proof` into main
  (`c8269cf`; `HANDOFF.md` and `TODO.md` conflicts kept both sides; the worktree is `ai`'s, left in place). Crouch: hold C or either Control;
  speed 0.4 of standing, cone range 1.5 times, angle unchanged, both tunables; the opponent does not crouch yet. **For `ai`:** `Player`
  gained `crouching` and `Input` an optional `crouching`; `Weapon` is unchanged by this slice, and `ai/` still imports no engine code.
  **Contract change:** none to `shared/` (the state hook's `vision.range` now reports the crouched reach). For `art`: nothing to wire.
  Specs `CrouchingToSeeFurther`, `CrouchingToWalkSlowly`; engine 570, webapp 139, `ai` 394; 89 of 89 specs on a production build; 23
  mutants killed. At the user's request the key listeners are one shared hook (`use-held-keys`). Not done: cover, quiet, heights, the bot
  crouching. The user reviewed it and played it with crouch ("works well"), so the factors stay as they are; they are committing it. They also said the bot is "fun to play against, easy to beat but it still
  needs a bit of moving and shooting", so `opponent/Difficulty.ts` stays unchanged.

- 2026-11-14, `art`: **Ogg page-duration fix delivered test-first**, with frozen
  baseline QA and preservation evidence in `webapp/audio/qa/ogg-pages/README.md`.
  Native and Chromium pass all 38 exports; WebKit falls from 34 to 23 failing
  candidates, with crouch levels fixed. Master/MP3 hashes and native-decoded music
  preserved. Remaining playback/format issues handed to build; production stays
  blocked. Flag-removal mutation killed by the regression tests. No runtime,
  dependency, model call or manifest change. Manifest keys: none.
  Root checks and post-shim-move audio checks pass; full master comparison passes
  in 321 seconds (21 files). Folder/caller and standards audit completed.

Newest first. One line each: date, who, what, where.

- 2026-11-14, `build`: **`ai` worktree merged (`f456130`; only `TODO.md` and `HANDOFF.md` conflicted, both sides kept), then heights, slice 1 (walking only), test first, uncommitted for the user's review.** The arena drawing reads `1` and `2` as floor one and two levels up and `^ v < >` as a stair that climbs the way it points; a stair must have plain floor behind and ahead of it, the far one a level higher. A stair is the only way across a drop (`engine/src/height/BlockedFrom`, judged from where the walker stood). **Contract change for `ai`/`art`: none to the weapon or manifest; the state hook's `player` snapshot gained `level` (`shared/`).** For `art`: the drawing uses the palette's `--color-gs-floor-l1` to `l3` for the levels, repeated in `arena-heights/colours/LevelColour.ts` since WebGL cannot read CSS variables; each stair is four shaded bands, no labels. `?scenario=heights` opens it. Engine 618, webapp 160, `ai` 419, 93 of 93 specs on a production build; 22 engine, 14 webapp and 6 browser mutants (the survivors closed with tests; one equivalent). Not done: vision over height, bullets and cover across levels, the opponent on stairs, a stair-flank check, the ring and timer. Manifest keys: none.

- 2026-11-14, `ai`: **main merged into the `ai/` worktree (`b276c64`), and the weapon evals now run on Haiku 5.5**, uncommitted for the user apart from the merge. Docs conflicts resolved keeping both sides (`TODO-art.md` is main's). Test first (`ai` 419 unit tests, 18 mutants killed): a shared key loader, `PaidWeaponModels` (both models behind the one spend guard, `maxTokens` 2000), and `RunPaidWeapon`, which fails a run in words when a paid call errored or an answer was cut off (the pipeline would swallow both and read them as a bad weapon) and logs tokens, stop reason and latency per request. **Haiku: 70 of 70 criteria at 3 trials, 101 calls, none cut off; a created weapon costs about $0.00036** (half the estimate; the draft weapon is only a name and six numbers), `docs/cost-and-budget.md`. **Prompt ablations on Haiku**: at first all six survived, because nothing there depended on the repair (the attack specs accept `invalid`); the user agreed to a criterion that "100 damage, 20 a second" still ends `created` inside the cap, and now skipping the repair falls exactly it, while dropping the `<previous>` block or the "change as little" sentence still passes (`docs/ai-pipeline.md`). **The user's stat-balancing design** (the AI returns inferred stats plus a preference, code balances) is in `TODO-ai.md` O2, with a question for `build` in `TODO.md` on where the balancer lives. Spend $0.32 of the $1 ceiling. Nothing for `build` or `art` to wire; no contract changed; manifest keys: none.

- 2026-11-14, `art`: **context-clear checkpoint prepared after user acceptance of review 06.**
  `TODO-art.md` now records frozen evidence distinctions, latest completed checks,
  build's new cone-slice handoff, owner requests and a next-session prompt. Resume
  with new AI/renderer evidence, otherwise audio codec QA; preserve approved kit 05
  and do not repeat the completed review. Art status updated; production/M2 and
  kit-selection evaluation stay open. Documentation only; manifest keys: none.

- 2026-11-14, `build`: **Forward vision cone, slice 1 (cone only), test first.** `engine/src/vision/` is new: a fighter sees a cone
  (`Weapon.visionDegrees`, `visionRange`: 90 degrees, rifle 12 tiles, marksman rifle 16; tunables) along their aim, blocked by walls; the player's
  view decides what is drawn (opponent, dummies, the opponent's bullets) and `VisibleToPlayer` is the function the server will reuse to filter
  snapshots. The bot now has the same cone. **For `ai`: `Weapon` gained two fields (`visionDegrees`, `visionRange`), which the weapon schema
  will need; `ai/` imports none of it and its 152 tests pass.** For `art`: nothing to wire (the dim veil is code). **Contract change:**
  the state hook's snapshot gained `vision {degrees, range}`, `opponent.visible` and `dummy.visible` (`shared/`). Spec `SeeingOnlyWhatYouFace`;
  engine 559, webapp 133; the duel, sparring, HUD and vision specs pass at `--repeat-each=10`; 31 mutants killed. At the user's request
  `vision/` was sub-foldered and the **folder-rule audit is now an explicit step in `AGENTS.md`** (before finishing) and `engine/AGENTS.md`.
  Not done: crouch, heights. Uncommitted, for the user's review.

- 2026-11-14, `art`: **Haiku review 06 delivered**, user-selected, under
  `docs/art/concepts/haiku-review-06/`: twelve saved outputs, six approved-kit
  comparisons, editable SVG/PNG native-size/grayscale/detail sheets and 96 held
  stamps. Frozen evidence and hashes distinguish the retained drawings from newer
  summaries and AI-reported 36-trial results. Prioritised silhouette/detail,
  lantern evidence and pose/contrast feedback for AI/build; kit approval retained.
  Validation recorded in the review's `Verification.json`. No new generation,
  corrected fixture, schema, runtime/audio change, dependency or commit.
  Manifest keys: none; production and kit-selection evaluation remain open.

- 2026-11-14, `ai`: **appearance work finished for now, uncommitted in the `ai/` worktree for the user.** Added `@langchain/anthropic` 1.6.0 (catalog,
  user-approved) and a Haiku 5.5 paid tier for the appearance spec behind a spend ledger capped at $1 total ($0.116 used); the user's key
  is in `ai/.env.local` (never read). Haiku: 33 of 36 drawings valid first time, 2 stand-ins (jellyfish lantern), about $0.0007 each; the
  user's verdict "nearly usable". Appearance code renamed to match the weapon (`drafting/`, `check/{fix,validate}`, nodes `generate, fix,
  validate, repair`); evals now have `AppearanceDsl` beside `WeaponSmithDsl`, a `when` takes its DSL, `tests/{weapon,appearance}`, the
  mapping grouped by subject. `ai` 394 unit tests, mutation-proved; weapon evals unchanged. Needs `build` for the integration: the call
  budget (about 1.08 extra calls) and the schema's home (`shared/` when the renderer imports it). Manifest keys: none.

- 2026-11-14, `art`: **user visually approved kit 05 (“looks really good”); context-clear checkpoint updated.**
  Next is AI's selection/placement comparison using the delivered catalogue/recipes, followed by art revisions
  from observed failures. While waiting, art can continue the recorded audio codec/browser blockers with
  approved masters preserved. `TODO-art.md`, shared art status and kit guide updated; production/M2 and
  runtime integration remain open. No new asset, schema, code, paid call or commit. Manifest keys: none.


- 2026-11-14, `art`: **authored weapon-parts kit 05 delivered** under `docs/art/concepts/weapon-parts-kit-05/`:
  18 original pieces, six primary/six alternate recipes, expanded JSON/SVGs, catalogue, native-size/grayscale
  and standing/crouched held reviews at four angles for both teams. Explicit recipe interpretation and identity
  limitations supplied to AI/build. Twelve geometry/SVG comparisons and AI-draft compatibility checks pass;
  nine faulty recipe controls rejected. User identity review and model-selection evaluation remain pending.
  Newer AI-worktree Haiku results acknowledged; no model call, runtime/schema edit, dependency or commit.
  Final root `pnpm checks` exits 0 (516 engine, 152 AI, 127 webapp, 253 audio passed / one skipped).
  Art's TODO and shared art status updated. Manifest keys: none.


- 2026-11-13, `art`: **context-clear review reconciled main with the AI worktree's newer visual findings.**
  `TODO-art.md` now prioritises the user's authored-parts kit (roughly 10–20 parts, anchors/parameters, six oddity
  compositions) for AI to probe. Source: worktree `docs/ai-visual-generation.md` and its TODO/handoff updates:
  primitive first answers 1/72 valid, 59/72 stand-ins, user judged none close. Main's best-of-three and compressed-audio
  deliveries retained; audio production remains blocked by measured codec/browser failures. No asset/schema/code change,
  worktree mutation, merge, paid call or commit. Shared art/AI status reconciled with main merge `e40e9a1`; outstanding
  owner requests updated. Root `pnpm checks` passes; documentation diff review passes.


- 2026-11-13, `art`: production-audio preparation in `webapp/audio/`: 38 Ogg/MP3 candidates, staged/hash-checked exporter,
  native verifier and isolated Chromium/WebKit harness with corrupt/discontinuous negative controls. Masters byte-identical
  in full-render comparison. Strict QA is red: 13 native/Chromium Vorbis effect-duration failures; WebKit 34 candidates fail
  duration/level/seam checks. Both MP3 music loops pass in both browsers. Production remains blocked; full details/reports
  linked in audio README. Root `pnpm checks` passes (audio 177 pass / one slow check skipped); separate full render passes,
  six mutants killed and both browser negative controls reject faulty fixtures. Homebrew FFmpeg/full and WebKit installed; pnpm dependencies unchanged. Manifest keys: none.


- 2026-11-13, `build`: **Best of three, test first.** The duel (`?scenario=duel`) is now a match, first to two rounds; sparring and
  the practice range are unchanged. `engine/` gains `match/` and an optional `World.match` that `step` scores once per round;
  the webapp gains a "Next round" button (the user chose a button over a timer, and a full reset of health, positions and
  magazines each round), "You won the match" / "You lost the match", a score readout and `nextRoundOfPage` (seed = page seed
  plus rounds played, so `?seed=` replays a whole match). **The state hook's snapshot gained an optional `match`**
  (`shared/src/state-hook/types/MatchSnapshot.ts`: `playerWins`, `opponentWins`, `round`), the one change in `shared/`.
  Found and fixed on the way: a click on an overlay button also pulled the trigger, firing a shot into the round it started.
  New spec `PlayingABestOfThree` (12 criteria); 73 acceptance specs pass, the duel specs 200 of 200 at `--repeat-each=10`;
  engine 512 and webapp 127 unit tests; 12 engine, 13 webapp and 7 browser mutants, all killed. No browser spec wins a round (measured over 60
  seeds: a win needs the aim taken at exactly 0.50 s of game time, so it is a timing window, not a seed; unit tests cover it). No contract changed; nothing for `ai` or `art` to wire. Uncommitted, for the user's review. **For `ai`:**
  root `pnpm checks` currently stops in `ai` (not my change): `ai/src/pipeline/appearance/` is untracked, with three red-first test
  files whose code does not exist yet, and Prettier flags two of them; `ai`'s other 27 files (163 tests) pass against this engine.

- 2026-11-13, `build`: **`engine/src/` sub-foldered, at the user's request, with a new `src/Engine.ts`.** No behaviour change.
  `Engine.ts` exports `engine = {startingWorld, step}` (the two calls that run a game; not a barrel); the webapp's game loop and
  `worldOfScenario` go through it. Paths moved inside `engine/`: the opponent's four states are now in
  `opponent/state/acting/` (with `aim/` under `engage/` and `cover/` under `reload/`), `StartingBrain` is in `opponent/brain/`,
  and the bullet's meeting helpers are in `bullet/flight/meeting/` (`Ray` moved from `geometry/types/` to
  `bullet/flight/types/`). **For `ai` and `art`:** nothing in `ai/`, `shared/` or `art`'s folders imports any of these paths
  (checked), and no contract changed; if `ai` later imports the engine, `@gunsmith/engine/Engine` is the front door and
  `@gunsmith/engine/arena/ArenaFrom` and `.../match/...` are unchanged. Engine 516, webapp 127 and `ai` 152 tests pass, and 73 of 73
  specs pass on the production build. Uncommitted: plain `mv`, so the index still lists some old paths as staged additions
  until the user re-adds.

- 2026-11-14, `build`: **The newest audio code (`webapp/audio/`: the compressed-candidate encoder, its checks and the browser QA) is
  cleaned up to the project's standards, at the user's request. No sound or output change.** `art`'s folder, so `art` should know
  where things went. `generator-scripts/encoding/` is now small named units under `EncodeAudio` and `verification/VerifyEncoded`
  (a test beside each; the one long integration test is one `it` per claim), and the `qa/` folder is gone: its browser check is
  `generator-scripts/browser/` (type-checked and linted, `pnpm verify:browser` unchanged), which **starts its own local server on a
  port the system picks, so the manual `python3 -m http.server 3187` step is no longer needed**. Fixed on the way: verification now
  decodes with the same `ffmpeg` build that encoded (it used the one on the path); the reports are written Prettier-formatted, so
  they pass `format:check`; the audition key is one constant (`output/mix/AuditionKey`); the page's limits are written once
  (`VERIFICATION_LIMITS`, with the loop-join limit the mastering one) instead of three times. **Unchanged, proved:** a fresh encode
  matches `encoded-audio/` (MP3 by hash, Ogg by decoded audio: Ogg bytes differ on every encode, its container carries a random
  serial number), and `verify:encoded` and `verify:browser` reproduce the committed `verification.json` and
  `browser-verification.json` byte for byte, **including your 13 native and the WebKit findings, which are still red**: they are
  `art`'s to resolve, and no limit was loosened. `pnpm checks` in `audio-studies` passes (254 tests, one slow render skipped);
  25 of 27 mutants were killed first time and the 2 survivors led to a new test and a removed redundant line; 5 of 5 browser
  mutants were killed by the runner's own controls. **Open for the user:** the browser check borrows Playwright from
  `acceptance-tests/` (`browser/playwright/LoadPlaywright`) rather than adding a dependency to `audio-studies`; adding
  `"@playwright/test": "catalog:"` there would remove that borrow and the hand-written Playwright types, and needs the user's say.

- 2026-11-13, `ai`: **very early look at JSON-generated weapon visuals, local tier only, nothing wired in.** `docs/ai-visual-generation.md`
  has the findings and the questions for `build`, `art` and the user. `ai/src/pipeline/appearance/` (strict validator, `check` with a `fix` step,
  one repair, disclosed stand-in) is a candidate, not a contract; nothing is in `shared/` and `generateWeapon` is unchanged. On
  `qwen3.5:9b`, 72 trials: first answers valid 1 of 72, 59 ended as the stand-in (stroke overshoot, foreign fields, token
  cut-offs); the call budget for wiring it in (five calls with repairs) is for `build` and the user. Also: `ai/src` regrouped
  by subject (`prompt-screening/`, `weapon-drafting/`, `check/`, `appearance/`, `graph/`, `worker/`), the evals got an
  appearance component in the DSL (`evals/` standing 36 of 36, own 0 of 17 as capability, weapon suites 70 of 70). 368 `ai` unit
  tests, mutation-proved. Uncommitted in the `ai/` worktree for the user to review. No paid call made; manifest keys: none.
  **Update, same day, key and Haiku 5.5 added (`@langchain/anthropic` 1.6.0, a spend ledger with a $1 total ceiling): the drawings are
  nearly usable** (36 drawings: 33 valid first time, 1 repaired, 2 stand-ins, 1.08 calls, about $0.0007 each); the local model is not
  (59 of 72 stand-ins). Ready for `build` to integrate: `ai/src/pipeline/appearance/` is the candidate, call budget and schema home are
  `build`'s and the user's call. Earlier note: the user looked at the local drawings: none came close. **Request to `art` (user's choice): explore a kit of authored parts with anchors and
  parameters** that a model picks from, in `TODO-art.md` A2; research and the other options are in the doc.
- 2026-11-13, `build`: **The audio code is cleaned up to the project's standards, at the user's request, with the audio
  unchanged.** `webapp/audio/` (`art`'s tooling workspace) was 704 lines of dense, flag-driven code with one test that rendered
  the whole pack twice (about eight minutes inside `pnpm checks`). Now: a voice is a tone or a noise (no more `frequency: 0` and
  boolean flags); the two tracks are data (`music/arrangements/`, eight-bar sections) read by one builder instead of a
  `calm: boolean` threaded through seven helpers; effect recipes are data; `WriteWav` and `MakeMix` are split into small pieces
  (header, PCM encoding, loop join, mix timeline, layering); the mastering numbers and tuned tables are named; duplicated
  helpers are one. **The pack is byte for byte the same:** every voice of both tracks and all effects was compared with the old
  code (1,656 + 94 voices identical), and the whole pack was re-rendered twice and compared with the committed `generated-audio/`
  (21 of 21 files identical). Tests: 175 in about a second (was 3, about 535 s), mutation-checked (126 of 133 killed; the rest
  equivalent or pinned by the render check). The full render is now `pnpm --filter @gunsmith/audio-studies test:render`
  (about 4 to 5 minutes, not in `checks`), and a recipe fingerprint test fails in milliseconds if any pitch, note or pattern
  changes. New `webapp/audio/AGENTS.md`; README and `TODO-art.md` updated. No contract, no manifest key, no game code touched.
  Afterwards, at the user's request, every folder of `generator-scripts/` was regrouped so its root is one entry file and its
  test (the layout is in `webapp/audio/AGENTS.md`); files were moved with plain `mv`, so the index shows them as deleted and
  untracked until you stage them. Then the folders were grouped in three layers: `generators/` (`effects`, `music`), `common/`
  (the vocabulary, the format, the noise seed, the footfall keys, `levels/`) and the consumers (`synthesis`, `output`, `pack`);
  two imports that ran against the grain (`NOISE_SEED`, `stepKey`) now come from `common/`.
  Uncommitted, for the user's review; **one slip:** a `git mv` staged the rename of `types/MetalNote.ts` into
  `effects/metallic/types/` in the index (the working tree is as intended); unstage it in your editor if you like.

- 2026-11-13, `art`: **context-clear checkpoint consolidated** in `TODO-art.md`: latest simple/rich references,
  explicit AI JSON/defaults evaluation task, build renderer experiment, art review and production-audio follow-up.
  All visual decisions remain provisional; approved audio retained. Shared art status updated. Documentation only;
  no new asset key, code, dependency, schema, model call or commit.

- 2026-11-13, `art`: **simpler references plus build/AI brief** in `docs/art/concepts/simple-machinery-04/`:
  six original 6–8-primitive bodies with matching appearance-only JSON, editable SVGs, colour/grayscale/native-size/held
  previews and a six-part lantern detail. Richer references preserved; all design/schema/default choices remain open.
  At the user's explicit request, `TODO-ai.md` now calls for JSON-generation complexity/reliability/defaults evaluation,
  including missing/invalid output, usable identity, bounded repair/fallback and measured cost. No eval performed here.
  Geometry/bounds/reference checks and five invalid probes pass; selected workspace checks green (492 engine, 101 webapp,
  67 AI). Two simpler image-generation attempts were rejected; supplied art is original vector geometry. Manifest keys:
  none; no runtime/schema/dependency/audio changes. The brief proposes experiments, not a frozen interface.

- 2026-11-12, `art`: **six new machinery concepts**, user-requested, in `docs/art/concepts/improbable-machinery-03.png`
  with reusable mass/mechanism rules in its sibling Markdown. Extends the new direction across all six original oddities;
  direction 02 supplied as the image reference. Original OpenAI-generated exploration, not production sprites or parsed
  weapon data. Earlier editable fixtures retained. Manifest keys: none; no runtime/schema/audio/dependency changes.

- 2026-11-12, `art`: **user-directed weapon style revision:** Ratchet & Clank-inspired inventive machinery adapted
  to overhead 2D. Original three-weapon direction sheet `docs/art/concepts/overhead-machinery-02.png` and sourced notes
  explain mass hierarchy, functional assemblies and candidate bounded material/corner/window rules. Earlier twelve
  editable JSON/vector studies retained as a first pass, not a frozen style. New sheet is OpenAI-generated reference;
  measured/editable translation remains next. Manifest keys: none; no runtime/schema/audio/dependency changes.
  Selected workspace checks pass (492 engine, 101 webapp, 67 AI); unchanged audio not repeated. PNG/link/diff checks pass.

- 2026-11-12, `art`: **twelve top-down studies and JSON handoff** in `docs/art/concepts/top-down-oddities/`:
  two designs per oddity, nine editable SVG sheets/ten PNGs, twelve appearance-only JSON examples, budgets and field/identity
  rules. Colour/grayscale, 64/32 px, held cardinal rotations, both teams/stances and pickup views reviewed. Model-free
  AI-worktree probe (`e1dffc0` pipeline plus uncommitted eval work) confirms only name/six stats; extra appearance/behaviour
  fields fail strict validation. Proposal now requests palette/detail tiers and measured grip/muzzle anchors; special
  behaviours remain build/AI-owned gaps. JSON/SVG equivalence, stroke bounds, references and six invalid probes pass.
  User authorised two variants and yellow/pink experiments. Manifest keys: none; no runtime/dependency/model changes.
  Final `pnpm checks` exits 0 (492 engine, 101 webapp, 67 AI, 3 audio); gameplay acceptance/model evals not run for art/docs.

- 2026-11-12, `art`: **user-directed concept planning:** before top-down studies, review the AI worktree's latest
  draft schemas/output shapes, including uncommitted changes. Iterate both ways: schemas inform concepts, and concept
  needs inform schema proposals. Neither the drafts nor art's proposal are final; art records concrete gaps/examples
  for AI/build rather than editing their code. Plan-phase checkpoint added to `TODO-art.md` and the shared status row.

- 2026-11-12, `ai`: **the evals are restructured in the acceptance-test style**, at the user's request and across two passes, in the
  `ai/` worktree, **uncommitted for the user's review and not in main**. Five test files in `ai/evals/tests/` (`given` / `when` /
  `thenExpect`, one criterion each) replace a table of 21 case rows scored by every evaluator in a loop. The root is now `tests | dsl |
  eval-criteria-mapping`, like `acceptance-tests/`, with lint stopping any import that runs upwards: the mapping holds the setup (the
  model tier, the trials, the real driver, the regression gate, the results file) and is the only layer that touches a model or a test
  runner; the DSL (`WeaponSmithDsl`) holds the checks behind it and reaches the pipeline only through a driver interface it owns, so
  its tests never need a model. What holds for every request is the DSL's **standing criteria**, added under each `when` by the mapping,
  so a test states only what is special to its request: 70 criteria now, up from 64 for a stated reason, not lost coverage. Failures
  read as one sentence per criterion. Test first, no money spent: `ai` 152 unit tests (was 134; the DSL and `WeaponSmithPipeline` have none of their own, the evals are their test), `pnpm evals:local` 70 of 70,
  `evals:fake` 62 of 70 (the 4 `when`s that need a real "no"), root `pnpm checks` exits 0. Proved able to fail: the earlier eval mutants
  sink the same `when`s, a broken gate leaves the fake tier green, a mapping that drops the standing criteria cuts 70 to 28, 12
  forbidden imports are each reported by lint, 84 of 85 unit-level mutants killed (one survivor: a repair-prompt sentence). Naming is in
  full (`weaponSmith`, `WeaponPipelineDependencies`). Nothing in `shared/`, nothing for `build` or `art` to wire, no contract changed.
  Found on the way: an ES module that exports `then` is a thenable, so the mapping's export is `thenExpect`. The DSL is a thin `try` / `catch`
  wrapper that rethrows a `DslError` naming the intention, over one lower-level `WeaponSmithPipeline` (the weapon smith's pipeline as the system under test: it asks and checks), as
  `GunsmithDsl` is over `GunsmithPlaywright` in `acceptance-tests/`, with lint holding the line. The user committed it all as `4cc580a`
  (not yet merged into main). Last tidy-ups: the evaluators are grouped by what they read (`outcome/`, `weapon/`, `player-visible/`),
  their test-only helpers live in `evaluators/testing/`, and the evals re-ran 70 of 70 after the moves.

- 2026-11-12, `ai`: **loop 2 done: the weapon pipeline is real past moderation** (`generate`, `validate`, `rate`, one `repair`), in
  the `ai/` worktree (`.claude/worktrees/ai-hosting-proof`), **uncommitted for the user's review and not in main**: main's `ai/` is
  still the committed state `build` merged (`8c52f5f`), so these edits apply cleanly on top of it. Test first, local tier only, no
  money spent. A request can now end `created`, `rejected` or the new `invalid` (a weapon request with no valid weapon even after
  the repair). The draft weapon schema is a name plus the six numbers `engine/`'s `Weapon` plays with, with one damage-per-second
  cap of 150 that `rate` enforces by refusing, never clamping; both are local to `ai/` and replaced by `build`'s contracts and
  power rating when they land. `ai` 134 unit tests (was 67), `pnpm evals:local` 21 of 21 strict, root `pnpm checks` exits 0 in
  the worktree; 36 of 37 mutants killed (the survivor is a repair-prompt sentence no case steers). Findings for everyone
  (`docs/ai-pipeline.md`): a bounded zod schema in `withStructuredOutput` throws on an out-of-range answer, and a repair shown
  only the faults overshoots. **For `build`: still owed, a shield behaviour** (directional, reflects bullets): a shield has no
  damage in the weapon shape, so a bare shield only passes because the repair gives it a 1-point bullet. Nothing in `shared/`,
  nothing for `art` to wire, no contract changed.

- 2026-11-12, `build`: **A simple opponent AI, test first (slice 3 of 3).** `engine/src/opponent/` is now a four-state bot
  (`wander`, `engage`, `reload`, `search`): it waits a reaction time, fires bursts sized by the weapon in hand with an aim error
  that settles over time, circles at a good range, takes cover to reload and searches the place it last saw the player. Its
  memory is `World.opponentBrain` (plain data, seeded; new `engine/random/NextRandom`), every tunable is one field of
  `opponent/Difficulty.ts`, and there is no pathfinder (a stuck bot drops its goal). An opponent with no brain takes no action,
  which is what sparring is; `DisarmOpponent` takes the brain away. Webapp: `?seed=` replays a duel, `worldOfPage()` replaces
  the scenario-plus-seed pair. The state hook's `opponent` gained `rounds` and `behaviour` (a plain string; `shared/` cannot
  read the engine's list). Acceptance: `AnOpponentWhoMoves`, `AnOpponentWhoReloads` (its own seed: the opponent reloads at 5.5 s,
  is full at 7.0 and wins at 9.4), a sparring "stays put" spec, `FightingBack` waits 15 s (9.4 s measured worst case over 40
  seeds), `startDuel()` pins a seed. `pnpm checks` green (`engine` 492, `webapp` 101, `ai` 67), 61
  acceptance specs, the duel, sparring and HUD specs at `--repeat-each=10`. Mutation: 128 engine, 13 of 14 webapp (one
  equivalent) and 12 of 15 browser mutants killed; `search` has no browser assertion of its own (the reload spec kills a
  never-search mutant only through the pinned fight's timing). Replaces the clock-driven `OpponentInput` and `burst/`. The tunables are guesses until the user plays it. No contract
  changed; nothing for `ai` or `art` to wire (the opponent is still a disc). Uncommitted, for the user's review.

- 2026-11-12, `build`: **The `ai/` package is merged into main** (`8c52f5f`), at the user's request: the branch
  `worktree-ai-hosting-proof` (the hosting proof, eval harness, token pre-check and moderation node, through `3abc33a`) merged
  into main with a real merge commit. Conflicts only in `pnpm-workspace.yaml` (both sides' catalog additions kept: art's
  `node-web-audio-api` and `ai`'s LangChain, LangGraph, `langsmith`, `wrangler` entries; `ai` joins `packages`;
  `trustPolicyExclude: chokidar@4.0.3` and `allowBuilds: workerd: false` arrive) and `pnpm-lock.yaml` (taken from main, then
  `pnpm install`; the only differences from main's are additions and a `supports-color` peer suffix, no version moved). Root
  `pnpm checks` exits 0: `engine` 324, `ai` 67, `webapp` 82 unit tests; the acceptance suite was not re-run because the merge
  touched no `webapp` or `engine` code. The `ai` worktree's uncommitted edits were not merged and are untouched; `ai` should
  `git merge main` there before its next change (main has the opponent bot, the health HUD and `Bullet.shooter`). Still owed to
  `ai` from `build`: a root `pnpm evals` script. No contract changed.

- 2026-11-12, `build`: **Health, a scripted opponent and a round win, test first (slices 1 and 2 of 3).** `engine/` gains
  `health/`, `round/` (`playing | won | lost`), `opponent/` (a brain that returns an `Input`, so the opponent is played by the
  same rules as the player: it faces the player, fires 0.5 s bursts every 2 s while no wall is between them, reloads when dry)
  and `game-loop/fighter/` (both fighters share `PrepareFighter` and `ShootFighter`); a `Bullet` carries its `shooter` and
  `advanceBullets` returns the damage that landed on each fighter; a finished round freezes the world but not the clock. The
  state hook's snapshot (`shared/src/state-hook/types/`) gained the player's `health`, `opponent` (`x`, `y`, `health`) and
  `round`. The page picks its match from the query: none is the practice range (no opponent, so the 43 old specs are
  unchanged), `?scenario=duel` the armed opponent, `?scenario=sparring` the same arena with one that cannot shoot (a
  temporary seam until a menu chooses). New DOM: `health-hud/` and a `round-banner/` overlay with a "Play again" button. New
  specs `BeatingTheOpponent`, `FightingBack`, `HealthOnTheScreen`; DSL `gunsmith.opponent`, `gunsmith.round`,
  `startDuel`/`startSparring`. 284 engine, 82 webapp, 55 acceptance (new ones pass at `--repeat-each=10`); `pnpm checks`
  green; 28 + 31 engine, 17 webapp and 11 browser mutants killed. Slice 3 (a simple opponent AI: a small state machine, planned with a web search first) is next. No contract changed;
  nothing for `ai` or `art` to wire (the opponent is a disc, no manifest key yet). Uncommitted, for the user's review.

- 2026-11-12, `art`: **TypeScript/Node audio regeneration**, user-approved `node-web-audio-api@2.2.0` (dev only).
  Replaced the Python sources with native Web Audio graphs under `docs/art/concepts/audio/src/`; regenerated all 14 WAVs
  (same 13 candidate mappings as audition 01, plus mixed audition), measurements and listening guide. The private
  `@gunsmith/audio-studies` tooling workspace reuses shared config and runs in `pnpm checks`; root changes register
  its path, pin the approved dependency and update the lockfile. No game-runtime/schema/manifest change. Command:
  `pnpm --filter @gunsmith/audio-studies render`. Test watched red first, all 3 header/crouch/determinism mutants killed;
  final `pnpm checks` green (274 engine, 78 webapp, 1 audio integration test), including native decoding and repeatability.
  Fresh listening review, full tracks, variants and production encoding remain pending; no browser gameplay suite run.

- 2026-11-12, `build`: **Webapp folder pass, at the user's direction.** Components now sit in `react/components/dom/<name>/`
  or `react/components/three/<name>/` (the canvas host `arena-canvas` is `three/`; below a top-level component, children share
  its kind and are flat). `currentWorld()` is now `gameState()`. The game store keeps `UseGameStore.ts` at the top and its
  reads in `store/game/selectors/<name>/` folders (`select-ammo-readout/`, `game-state/`). A blank line goes between sibling
  JSX elements, DOM and r3f alike, written up in the new `webapp/src/react/AGENTS.md` (which the root file already pointed
  to). Eight pressed-together siblings fixed. `pnpm checks` green, 43 acceptance specs green. No contract changed; nothing
  for `ai` or `art` to wire. Next for `build`: health, a scripted opponent and a round win (`TODO-build.md`).

- 2026-11-12, `build`: **Zustand replaces the planned Redux, and the ammo HUD is plain React.** Redux was never installed;
  `zustand` 5.0.16 (the version react-three-fiber already uses; 5.1.0 was under seven days old) is the one state library.
  `webapp/src` is now `react/` → `store/` → `game/`, enforced by ESLint. The game store (`store/game/`) holds the engine's
  `World` and nothing else (lint allow-list plus a key-pinning test); the loop writes it once a frame and `useFrame` reads it
  with `gameState()`. The practice arena moved to `game/practice/`. The canvas `AmmoPips` is replaced by `react/components/dom/ammo-hud/`
  (Tailwind, a CSS reload fill) with a new spec `AmmoOnTheScreen` and DSL `gunsmith.hud`. 193 engine, 62 webapp, 43 acceptance;
  `pnpm checks` green; store, selector and HUD mutants killed (one equivalent survivor: a redundant extra `setWorld`). No
  contract changed and nothing for `ai` or `art` to wire. `docs/state-management.md` records the decision.

- 2026-11-12, `art`: **audio audition 01** in `docs/art/concepts/audio/` (original local Python synthesis): 15-second
  match/menu sketches, all 11 static effect candidates and a mixed audition, source, listening guide and measurements.
  Candidate mappings: `music-loop-menu`, `music-loop-match`, `sfx-pickup`, `sfx-drop`, `sfx-reload`, `sfx-step-stand`,
  `sfx-step-crouch`, `sfx-hit`, `sfx-death`, `sfx-ring-warning`, `sfx-ui-click`, `sfx-round-start`, `sfx-round-end`.
  No production keys registered or runtime changes. User chose industrial electronic, driving match music, local synthesis;
  A6 now leads art's queue. Listening review, full-length loops/step variants, Ogg/MP3 and manifest integration remain open.
  Technical WAV/repeat/reproducibility checks pass; `pnpm checks` passes (193 engine, 62 webapp tests); no browser gameplay
  acceptance run for this offline art delivery. Listening not signed off.

- 2026-11-12, `ai`: **user ruling on shields and armour, for `build` and `art`:** no standalone shields or armour, but the weapon
  itself may be a shield that has a direction and could reflect bullets, if defined correctly. Moderation now accepts shields as
  weapons and rejects worn armour (4 eval cases, `evals:local` 21 of 21, mutation-proved; `ai/` worktree, uncommitted). Nothing
  else changed: a shield that reflects bullets is a behaviour class the engine, the weapon schema and `art`'s visual grammar do not
  have, so add it to the behaviour vocabulary when the weapon schema is drafted. Not a contract change; no money spent.
- 2026-11-12, `ai`: **loop 1b done: moderation probed with 46 borderline requests** (in the `ai/` worktree, uncommitted).
  One real failure (weapon keywords round an off-topic ask) became a case and a one-sentence prompt fix; removing it makes that
  case fall; local evals 18 of 18, root `pnpm checks` exits 0. The "say no" rule and data-block paragraph remain unproven on
  `qwen3.5:9b`. Open for the user: do shields and armor count as weapons? Nothing for `build` or `art`; no money spent.
- 2026-11-12, `ai`: **main merged into `worktree-ai-hosting-proof` (`ee7a571`, no conflicts) and the moderation node built, test
  first**, in the `ai/` worktree, uncommitted for the user's review; still not merged into main. `ai/src/pipeline/moderation/`
  (one cheap-model call by function calling, zod-parsed, player text in a `<request>` data block, fail closed). Local evals 17 of
  17 strict; `ai` 67, `engine` 117, `webapp` 40 unit tests; root `pnpm checks` exits 0. Eight mutants killed, four prompt mutants
  survived (the cases do not yet steer prompt wording; `ai/AGENTS.md`). Nothing in `shared/`, nothing for `build` or `art` to
  wire, no contract changed, no money spent.
- 2026-11-12, `ai`: **context-clear checkpoint** (`TODO-ai.md`, "Resume here"). The user committed `ai/` on the branch
  `worktree-ai-hosting-proof` (`f25ad50`, on top of a WIP commit and a merge of main); **not merged into main**, which has moved on
  (`46315d5`). Weapon pipeline: real token pre-check, then a stub; 17 eval cases, 7 evaluators, local Ollama tier. For `build`
  before the merge: `pnpm-workspace.yaml` (add `ai`; LangChain, LangGraph, `langsmith`, `wrangler` catalog entries; one `zod`;
  `trustPolicyExclude: chokidar@4.0.3`; `allowBuilds: workerd: false`), the lockfile, and a root `pnpm evals` script are the
  touch points. Nothing in `shared/`. The weapon and arena schemas in `ai/` are drafts until `build`'s contracts land.
- 2026-11-12, `art`: context-clear checkpoint in `TODO-art.md` consolidates all user decisions, delivered files,
  remaining defaults question and next task (top-down oddity studies). Dim-map, weapon/stance cone, stair and crouch
  decisions are settled. Production waits for a manifest; visual-schema work remains a proposal. No runtime changes.
- 2026-11-12, `build`: **Reload, magazine, reserve and weapon switching, test first.** The weapon is now a real type:
  `engine/` gains `weapon/` (`Weapon`, `Rifle`, `MarksmanRifle`, `TriggerPull`, `SpendRound`, `ReloadWeapon`) and `loadout/`
  (`SwitchWeapon`, `EquippedWeapon`, `StartingLoadout`, `CarriedWeapon`); a `Bullet` carries its own damage and speed, so the
  loose damage, fire-interval and bullet-speed constants are gone. Keys 1 and 2 switch weapon (rifle 25 damage and 12 rounds,
  marksman rifle 50 damage and 5), R reloads (manual, no auto-reload; one cool-down shared by both), ammunition shows as pips
  along the top wall. The state hook's snapshot (`shared/src/state-hook/types/`) gained `weapon` (`slot`, `rounds`, `reserve`,
  `reloading`). New DSL: `gunsmith.weapon`, `player.reload()`, `player.switchTo(slot)`; new specs `ReloadingTheWeapon` and
  `SwitchingWeapons` (10). 193 engine and 60 webapp unit tests and 37 acceptance specs; 45 of 46 engine, 16 of 16 webapp and
  17 of 17 browser mutants killed (one equivalent survivor); `pnpm checks` green. The weapon numbers are placeholders set in
  `Rifle.ts` and `MarksmanRifle.ts`. This is the shape the weapon schema will take when `ai` needs it, but nothing moved to
  `shared/` and no contract changed: nothing for `ai` or `art` to wire (the weapons have no manifest keys yet).

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
- 2026-11-12, `ai`: **evals re-based on the research** (Focused, Anthropic, Hamel Husain; no source gives a cap, so the
  "about 10" rule was dropped): 17 weapon cases tagged `regression` or `capability`, 7 evaluators, 3 trials on the local tier
  (pass^k), a regression-only gate (`EVAL_GATE=regression`), the LLM judge deferred. In the `ai/` worktree, uncommitted.
- 2026-11-12, `ai`: **main merged into the `ai/` worktree and `ai/` fitted to `engine/`'s conventions** (self-named imports and an
  `exports` map so `api/` can import it as raw source, types in `types/`, doc comments). Root `pnpm checks` exits 0 there. For
  `build`: when `ai/` merges, `pnpm-workspace.yaml` gains `ai` in `packages` and the catalog entries for LangChain, LangGraph,
  `langsmith`, `wrangler` (the one `zod` entry stays), plus `trustPolicyExclude: chokidar@4.0.3` and `allowBuilds: workerd: false`.
  (Superseded: the user has since committed it on the branch; see the newest `ai` entry.)
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
