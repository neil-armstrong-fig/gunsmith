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
| `ai` | `TODO-ai.md` | Worker hosting decided; committed weapon pipeline and eval DSL merged into main at `e40e9a1`. Later uncommitted AI worktree findings: primitive appearance probe 1/72 strict first answers valid, 59/72 stand-ins; user judged none close. AI reports 368 unit tests, 36/36 standing and 0/17 capability appearance criteria, weapon evals 70/70. User chose art-authored parts kit next; AI probes selection/placement once supplied. See worktree `docs/ai-visual-generation.md`; appearance remains unwired, M2 contracts/call-budget/tolerance policies open, paid re-probe needs approval and capped key | 2026-11-13 |
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
