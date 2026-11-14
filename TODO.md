# TODO: the north star path

The shared path all three personas feed. Each persona keeps their own checklist (`TODO-build.md`, `TODO-ai.md`,
`TODO-art.md`); this file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session, no exceptions)

1. Read `AGENTS.md`, `HANDOFF.md`, this file, and **all three** persona TODOs: `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`.
2. Before doing anything, say in a few lines: which milestone the project is on, what each of the other two personas is
   doing or waiting on, and what *you* are about to do and whether anything blocks it.
3. If another persona's checklist shows work that depends on yours (or yours on theirs), say so now, and put the
   dependency in "Blockers and requests" below.
4. At the end of your session: tick your own TODO, update your row in the milestone table, add any new blocker, and add a
   line to the delivery log in `HANDOFF.md`.

Start a session with: **"You are build|ai|art, continue the TODO."**

## Status board

Update the one-line status for your persona at the end of each session.

| Persona | Checklist | Current focus | Last updated |
| ------- | --------- | ------------- | ------------ |
| `build` | `TODO-build.md` | Game first, test first, full-screen. Committed through `8c52f5f` (the duel is in `54b4085`; `ai/` merged in): `acceptance-tests/` and `engine/` packages; the player walks with walls, aims with the mouse, fires bullets that die on walls, shoots practice dummies that fall, carries two weapons (keys 1 and 2, R reloads, ammunition in a plain-React HUD) with a real `Weapon` type (43 specs, 193 engine and 62 webapp unit tests, all mutation-proved); state is Zustand (a game-only game store, a plain-React ammo HUD, layering lint-enforced). Contracts and menus are withdrawn until the game is fun. A duel now exists (`?scenario=duel`): an opponent with a small state-machine brain (wander, engage, reload, search; a reaction time, aim that settles, circling, cover to reload; seeded, so `?seed=42` replays it), a health HUD, a won or lost round and a "Play again" overlay (61 specs, 492 engine and 101 webapp unit tests, all mutation-proved; `ai` 67). **The duel is now a best-of-three** (2026-11-13): first to two rounds, a "Next round" button, full reset each round, a score readout, the banner says who won the round and the match (73 specs, 516 engine and 127 webapp unit tests, 34 mutants killed). `engine/src/` is sub-foldered and has a front door, `Engine.ts` (no behaviour change); the newest audio code (`webapp/audio/`) is cleaned up, output unchanged (2026-11-14). **All uncommitted, for the user's review; resume from `TODO-build.md` "Resume here".** Next: the user plays the duel and the bot's tunables (`opponent/Difficulty.ts`) are set by feel; then the dim arena and the cone, the closing ring | 2026-11-13 |
| `ai` | `TODO-ai.md` | O1 decided: pipeline runs inside the Worker (no Plus); budget $1 a day, $20 month hard cap. Eval-driven setup built (17 weapon cases, 7 evaluators, local Ollama tier); `ai/` is **merged into main** (`8c52f5f`, 2026-11-12). The moderation node is built and probed with 46 borderline requests (local evals 21 of 21, shields accepted as weapons and armour rejected per the user's ruling). The weapon pipeline is now real end to end (`generate`, `validate`, `rate`, one `repair`; new `invalid` outcome; 36 of 37 mutants killed), and the evals are now **acceptance-test style** (five test files in `evals/tests/` over `dsl` and `eval-criteria-mapping` with lint-enforced layers, standing criteria added under every `when`, and a thin `try`/`catch` DSL over one `WeaponSmithPipeline`; local 70 of 70 criteria, 152 `ai` unit tests; the DSL and pipeline have none of their own, the evals are their test), built in the `ai/` worktree and **committed by the user** (`4cc580a`) but not yet merged into main, so main's `ai/` is still the older state; the worktree needs `git merge main` to pick up the bot and the duel. Next: `git merge main` in the worktree, then land it, a small Haiku run once a capped key exists, the real `StateGraph` and `AiAdapter` mapping. Waiting for the contracts (M2); `build` still owes a shield behaviour. **2026-11-13: very early look at JSON weapon visuals done** (`docs/ai-visual-generation.md`: `ai/src/pipeline/appearance/`, not wired in; local model, first answers valid 1 of 72, 59 of 72 ended as the disclosed stand-in; evals 36 of 36 standing, 0 of 17 capability); `ai/src` regrouped into `prompt-screening/`, `weapon-drafting/`, `check/`, `appearance/`, `graph/`, `worker/`, evals appearance DSL added; 368 `ai` unit tests, weapon evals 70 of 70. Needs `build` and `art` on the questions in that doc. **2026-11-14:** Haiku 5.5 draws well (33 of 36 valid first time); the appearance work, the DSL-at-`when` eval refactor and the `evals/tests/{weapon,appearance}` and mapping regroup are uncommitted in the worktree for the user (394 `ai` tests); see `TODO-ai.md` "Resume here" | 2026-11-14 |
| `art` | `TODO-art.md` | Delivered kit 05: 18 authored parts, six oddities plus six alternates, named anchors/bounded choices, JSON/SVGs and size/grayscale/held reviews. User visually approved the kit (“looks really good”); AI selection/placement comparison next. Art reviews measured failures, or continues audio codec QA while waiting. Newer Haiku findings acknowledged in kit brief. Audio production remains blocked by recorded codec/browser QA | 2026-11-14 |

## The path

Milestones in order. A milestone is done when every persona row that applies is ticked and the "done when" holds.
Rows can overlap when nothing blocks them.

| # | Milestone | `build` | `ai` | `art` | Done when |
| - | --------- | ------- | ---- | ----- | --------- |
| M0 | **Foundation** (this repo's docs) | Docs, AGENTS.md, TODO set | | | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **A fun, playable game** (was: fuzzy frontend, dropped 2026-11-12) | Phase 0 scaffold, then Phase 1 (engine and acceptance tests, one spec per mechanic; menus come after) | O1 hosting comparison (no code needed from `build`) | A1 palette and brief; early concept sheets | Someone who has never seen it can play a best-of-three against the scripted opponent in a full-screen arena with fog, heights, crouch and the ring, and it is fun. First look by the user. |
| M2 | **Contracts frozen** (un-frozen 2026-11-12: nothing is drafted until the game needs it) | Schemas, `AiAdapter`, `CreditLedger`, asset manifest, drafted test-first; `HANDOFF.md` current | Reviews the schemas and adapter; asks for changes now, not later | Reviews the manifest; asks for changes now | `HANDOFF.md` "What is ready" rows 1 to 4 are ticked and `ai` and `art` have signed off in the delivery log. |
| M3 | **Focus: ATDD and the real engine** | Phase B (specs test-first, area by area) and Phase C (standards, packages, CI) and D (engine, caps, validator) | O2 pipeline against the fake graph inputs; datasets started from fixtures | A2 to A4: sprites, tiles, UI to the manifest | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Phase E (API, auth, D1, `Match` DO, fog filtering, rooms, matchmaker) and the free-plan spike | O3 credit spend against the real ledger; the kill-switch flag | A5 copy; A6 static sounds | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | Swaps the real adapter in; wires the AI-off banner and refunds | O2 and O3 finished; O4 tracing and first evals | Wires nothing; supports with example prompts for datasets | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | Wires deliveries through the manifest; no placeholder left | Weapon sound-block fuzz tests | Finishes A7 and A8 | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Phase F: infra, throwaway deploy, real domain, post-deploy acceptance, scrub checklist | Evals gate on in CI; budget alerts live | Logo, social image, legal copy final | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | Tuning pass on the tunables; known bugs | O4 finished; case-study material; model bake-off | Case-study illustrations | The case study can be written from `docs/focused-case-study.md` and real numbers. |

## Blockers and requests (newest first)

- 2026-11-14, `art` to `ai` / `build`: authored kit 05 is delivered in
  `docs/art/concepts/weapon-parts-kit-05/README.md`. Eighteen pieces, twelve recipes and exact assembly
  conventions are ready for a selection/placement comparison. User visually approved the kit (“looks really good”);
  M2/runtime contracts remain open. Newer AI-worktree Haiku findings are acknowledged in the brief.

- 2026-11-13, `art` to `build`: compressed audio candidates fail strict production QA in the measured codec/browser matrix.
  Do not integrate them yet. `webapp/audio/README.md` links native and Chromium/WebKit reports; masters remain unchanged.
  Manifest agreement, device/fatigue listening and masking with the real shot synth remain pending.

- 2026-11-13, `ai` to `build`, `art` and the user: first look at AI-drawn weapon visuals is in `docs/ai-visual-generation.md`
  (local model only, nothing wired into `generateWeapon`). It needs answers to: (1) **call budget**, appearance in the stats
  call or a second one (it makes five calls with repairs, against the three the weapon criterion allows); (2) the **tolerance
  policy**, may code prune foreign fields and accept up to 2 units of stroke overshoot; (3) where completion and the stand-in
  live; (4) `art`: are 24 parts, anchors and palette roles right, and is a recipe vocabulary worth drafting; (5) the user:
  looked at the contact sheet and **none of the local model's drawings came close**; next pass separates a weak model from a hard
  method (Haiku re-probe first, needs a capped key; then drawing tools or a recipe kit; research in the doc).
  **Update 2026-11-13: on Haiku 5.5 the drawings are nearly usable** (36 drawings: 33 valid first time, 1 repaired, 2 stand-ins,
  both the jellyfish lantern; about 1.1 calls and $0.0007 each). The user's call: integrate with `build` first, tune from there.
  Needs `build`: call budget (about one extra call, 1.1 on average), where the schema lives (`shared/` once the renderer imports it).
  **`art`:** the user chose the kit of parts to explore first (`TODO-art.md`, A2): a small set of authored parts with anchors and
  parameters that a model picks from; `ai` probes the picking once the kit exists. The omitted-stat policy is
  separate and still open.

- 2026-11-13, user via `art` to `ai` and `build`: evaluate JSON-based weapon appearance generation and safe visual
  defaults before freezing design. Explicit task in `TODO-ai.md`; provisional build/AI brief and six low-complexity
  references in `docs/art/concepts/simple-machinery-04/README.md`. Compare approaches and prove usable identity,
  bounded output, missing/invalid-field behaviour, repair/fallback and cost. All design choices remain open.

- 2026-11-12, `art` to `build` and `ai`: twelve concrete top-down appearance fixtures and generic drawing rules are ready in `docs/art/concepts/top-down-oddities/README.md`. Review palette assignments, structural/fine detail and grip/muzzle anchors. Current draft has only name/six stats; ricochet, shotgun, explosion, beam and reflective-shield gameplay need explicit owned contracts.

- 2026-11-12, `art` to `build` and `ai`: schema/renderer changes are allowed during development; runtime-generated code is not. Concrete visual-schema proposal and owner tasks are now submitted: `docs/art/visual-schema-proposal.md`. Review before freezing M2; initial limits are proposals to measure.
- 2026-11-12, `art` to `build` and `ai`: crouch must increase forward vision range (same angle/occlusion). Prompt-malleable art needs a visual-description contract: current weapon schema has stats/colour/behaviour but no body/barrel/attachment/effect descriptions. See `docs/art/README.md` and the six oddity prompts before freezing M2.
- 2026-11-12, `art` to `build` and `ai`: user requires stairs as the only height transition, landings on both connected levels, no arena level labels, and prompt-configured forward-cone vision. Update owned schemas, fixtures, engine and generation from the revision in `HANDOFF.md`; weapon-based cone ownership is confirmed; omitted-stat policy awaits the user’s answer.
- 2026-11-12, `art` to `build`: A1 concepts and proposed palette tokens are ready in `docs/art/README.md`; A2–A4 final files wait for the runtime asset manifest (keys, sizes, anchors, formats and tint layers) and behaviour enum. Request art review at M2.
One line each: who is asking whom for what, and since when. Delete the line when it is answered.

- 2026-11-12, `build` to `ai` and `art`: **the draft contracts are withdrawn.** `shared/src` (weapon and arena schemas,
  `AiAdapter`, `CreditLedger`) is deleted at the user's request; the game comes first and nothing goes in `shared/` until
  two packages need it. Do not build or review against it. `build` will announce here, and in `HANDOFF.md`, when a shape
  returns. `art`'s palette tokens in `webapp/src/index.css` stay.

- 2026-11-12, `ai` to `build`: **the pipeline runs inside the Worker, so `api/` will import `ai/`** (`AGENTS.md` table and
  `HANDOFF.md` updated; add `@gunsmith/ai` to `api/`'s `allowedPackages` when you scaffold it). No HTTP client in `shared/`.
  **Done 2026-11-12:** the `ai` package is merged into main (`8c52f5f`). Its catalog entries, `trustPolicyExclude: chokidar@4.0.3`
  and `allowBuilds: workerd: false` are in `pnpm-workspace.yaml`, and the lockfile was completed with `pnpm install` (no
  already-locked package changed version). Still owed to `ai` from `build`: a root `pnpm evals` script.
- 2026-11-12, `ai` to `build`: Workers Paid is no longer forced by the AI. The only open question for it is `build`'s
  Durable Object spike, plus a CPU re-measure of the real pipeline.
- 2026-11-12, `ai`, open: `art` asks `build` and `ai` to follow the stairs, no-level-labels and forward-cone revision (see
  `HANDOFF.md`). `ai` will review the schemas for it at M2; weapon-based cone ownership is confirmed; the omitted-stat policy awaits the user.

## Open questions and tunables (not blockers)

- [ ] Numbers to tune in play (one config each, `docs/game-design.md`): tick rate 20 Hz, arena size, HP 100, round timer,
      ring timing and damage, spectator delay default, saved-item limits (arenas and weapons), power caps, rating window.
- [ ] The case study's home (personal-site entry or a series): decide once it is done.
- [ ] Final name check (`Gunsmith`) and the subdomain `gunsmith.neilarmstrong.dev`.
- [ ] Whether `api/` imports `ai/` or calls it over HTTP (decided by `ai` in O1; `AGENTS.md` table updates).
- [ ] Free plan or Workers Paid (decided by the `build` spike and `ai`'s hosting comparison, together).

## Legend

`[ ]` to do, `[x]` done, `(spike)` a time-boxed experiment that ends in a written decision, `(unverified)` a fact the
research could not confirm, so check it before relying on it.
