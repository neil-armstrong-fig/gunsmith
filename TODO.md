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
| `build` | `TODO-build.md` | Game first, test first, full-screen. Committed through `8c52f5f` (the duel is in `54b4085`; `ai/` merged in): `acceptance-tests/` and `engine/` packages; the player walks with walls, aims with the mouse, fires bullets that die on walls, shoots practice dummies that fall, carries two weapons (keys 1 and 2, R reloads, ammunition in a plain-React HUD) with a real `Weapon` type (43 specs, 193 engine and 62 webapp unit tests, all mutation-proved); state is Zustand (a game-only game store, a plain-React ammo HUD, layering lint-enforced). Contracts and menus are withdrawn until the game is fun. A duel now exists (`?scenario=duel`): an opponent with a small state-machine brain (wander, engage, reload, search; a reaction time, aim that settles, circling, cover to reload; seeded, so `?seed=42` replays it), a health HUD, a won or lost round and a "Play again" overlay (61 specs, 492 engine and 101 webapp unit tests, all mutation-proved; `ai` 67). **The duel is now a best-of-three** (2026-11-13): first to two rounds, a "Next round" button, full reset each round, a score readout, the banner says who won the round and the match (73 specs, 516 engine and 127 webapp unit tests, 34 mutants killed). `engine/src/` is sub-foldered and has a front door, `Engine.ts` (no behaviour change); the newest audio code (`webapp/audio/`) is cleaned up, output unchanged (2026-11-14). **All uncommitted, for the user's review; resume from `TODO-build.md` "Resume here".** **Forward vision cone, slice 1** (2026-11-14): `engine/src/vision/`, weapon-set cone (90 degrees, 12/16 tiles), a dim veil, the bot sees through the same cone (engine 559, webapp 133, 80+ specs). **Crouch, slice 2** (2026-11-14, reviewed and played by the user, "works well"): hold C or Control to walk at 0.4 speed and see 1.5 times as far (same angle), tunables, the bot does not crouch (engine 570, webapp 139, 89 specs). `ai` worktree merged at `c8269cf`, then again at `f456130` (Haiku evals). **Heights, slice 1** (2026-11-14, uncommitted for the user's review): levels `1`/`2` and stairs `^ v < >` in the arena drawing, a stair is the only way across a drop (`engine/src/height/`), snapshot `player.level` (a `shared/` field added), `?scenario=heights`, spec `ClimbingAStair` (engine 618, webapp 160, 93 specs, 22 engine, 14 webapp and 6 browser mutants checked). **Heights, slice 2** (2026-11-14, uncommitted for the user's review; `ai` worktree merged again at `ceb5063`): vision over height, the simple level rule (a tile blocks sight if it is a wall or on a level higher than the viewer's eye; a stair counts as its upper level), so low ground cannot see up and a platform sees down; `?scenario=heights` has a dummy on each level; spec `SeeingAcrossLevels` (engine 661, webapp 161, 98 specs, 21 of 22 engine and 3 browser mutants killed, the survivor equivalent). The platform edges now have a lip and a shadow (the user: "looks great"); `PushOutOfWalls`, `vision/` and `HeightTilesOf` were split into helper folders (engine 679, webapp 179). A longer reach for higher ground is an idea, not built. **Heights, slice 3** (2026-11-15, uncommitted for the user's review; `ai` worktree merged again at `11f7f45`): bullets follow the sight rule: a bullet keeps the eye level of its shooter and stops at a wall or any higher tile (`BlocksSightFrom`), so a platform's face stops shots from the low ground and a platform's shots fly out over it; the bot too; spec `ShootingAcrossLevels` (engine 690, webapp 179, 102 specs, 7 mutants killed). **Closing ring, planned with the user (2026-11-15): a shrinking circle on a seeded reachable point, the timer starts it, damage ramps until someone dies; slices timer, ring and damage, bot walks inward. Slice 1, the round timer** (uncommitted for the user's review): `engine/src/ring/` clock that stops with the round, `World.ring?` (duel only), "Ring in 0:43" under the score, the hook's `ring.secondsUntilStart` (`shared/` field added), spec `CountingDownToTheRing` (engine 700, webapp 191, 112 specs, 460 of 460 at 10 repeats, 22 unit and 10 browser mutants killed). **Closing ring, slice 2, the ring and its damage** (2026-11-15, uncommitted for the user's review; slice 1 was committed): a seeded centre on ground both fighters can walk to (a platform only by its stair), a radius that is a pure function of the clock (arena-covering, then a straight line to 2 tiles), damage 2 to 20 a second outside it, ring timing in the query (`?ringDelay=`, `?ringClosing=`, the user's choice of seam), the edge drawn on the canvas, the hook's `ring.centre/radius/damagePerSecond` (`shared/`), spec `TheClosingRing` on sparring (the duel bot would decide a short ring; **a deviation from the user's wording, to veto**): one round won and one lost by the ring, a pinned seed each (engine 761, webapp 223, 127 specs on a production build, 27 engine, 20 webapp and 8 browser mutants). **Closing ring, slice 3, the bot walks inward** (2026-11-16, uncommitted for the user's review; slices 1 and 2 committed): once the ring is closing the bot keeps 2 tiles inside its edge (`engine/src/opponent/shelter/`, `DIFFICULTY.ringMargin`), still firing at the player it sees, and walks round a pillar by a stateless waypoint; the user chose "walk in and keep firing" and "before the edge reaches it"; spec `TheOpponentStayingInTheRing` on the duel with ring timing (engine 783, webapp 233, 137 specs on a production build, 710 of 710 at 10 repeats for the ring, duel, HUD and sparring specs; 15 unit and 4 browser mutants killed, 2 survivors closed). **The closing ring is done. Next: the opponent on stairs and a stair-flank validator, then art's queued asks (reticle, game juice, empty click, fair arenas)** | 2026-11-16 |
| `ai` | `TODO-ai.md` | Weapon pipeline and accepted appearance generation are merged through `11f7f45`; integration remains open. [2026-11-15 AI handoff](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15): separate stats/appearance calls, five maximum; combined estimate $1.06 per 1,000 weapons, roughly three times stats alone, to measure end to end. Preserve cumulative eval spend (about $0.4674 of $1 in the old worktree) before paid runs from main. AI coding session implements; Codex documents/reviews. Schema moves to shared only with a renderer consumer; stat balancer follows integration. | 2026-11-15 |
| `art` | `TODO-art.md` | [Precision reticle](docs/art/concepts/aim-reticle/README.md) delivered for visual review: static crosshair, 32/64 px PNGs, SVG and context sheet; build integration/manifest remain open. Fair-play research delivered. Next: damage/game juice, empty-weapon click, symmetrical arenas; M2/audio blockers remain open | 2026-11-16 |

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

- 2026-11-15, `art/research` to `build` / `ai`: implement the
  [fair-play handoff](docs/art/fair-play-research.md) with online play, test first.
  Public queue requires Google sign-in; guests retain practice/private rooms.
  Build owns authoritative prevention, bounded recordings/private R2 access,
  participant reports and two isolated silent matchmaking pools; AI coordinates
  atomic generation allowances/global spend reservations. Recovery requires clean
  completed matches, not inactivity; human override remains. Behavioral rules start
  in observation mode and require calibration before automatic restrictions.
  No shared route/schema is frozen and this does not block M1. Setup/retention and
  erasure validation are launch work, not completed infrastructure.

- 2026-11-15, user via Codex to `ai` / `build`: the appearance call budget is settled: separate stats and
  appearance generation, five calls maximum (three clean). Follow the
  [AI integration handoff](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15); measure the combined cost
  and latency against the estimate of $1.06 per 1,000 weapons. Coordinate the renderer/schema consumer with build;
  no premature shared schema. Preserve the old worktree's cumulative eval spend before paid runs from main.
  Codex is documentation/review only for this task; AI session owns code. This supersedes older call-budget questions.

- 2026-11-15, user via `art` to `build` / `ai`: queued a fairness study requiring
  symmetrical arenas and equivalent starting access to high ground; weapon
  placement remains random. Study geometry, heights, cover, stairs, sightlines
  and ring escape; deterministic finalisation/validation should enforce the
  resulting constraints for generated and built-in arenas. Art's new reticle,
  taking-damage/game-juice study and empty-weapon click also need build integration.


- 2026-11-14, `art` to `build`: sample-alignment diagnosis is delivered in
  `webapp/audio/qa/webkit-alignment/README.md`. Informative WebKit windows show
  shifted Vorbis and delayed MP3 effects, including correct-duration files.
  Reproduce in the eventual playback path before deciding timing corrections;
  no blanket trimming or format change is authorised by this evidence.

- 2026-11-14, `ai` to `build` (and the user): the user's design for stats is that the model returns the **stat values it infers plus the
  player's stat preference**, and **code balances the weapon afterwards** (a high stat costs the others, so "max everything" cannot
  happen). Not started; it needs your say on **where the balancer lives**: it is the power rating run backwards, which `engine/` owns
  (`HANDOFF.md`), so probably there, with `ai/` using a local draft until then. Also open: the budget (the engine's rating, not a sum
  of stats), how a preference is encoded, and the omitted-stat default (the user's). Detail in `TODO-ai.md` O2.

- 2026-11-14, `art` to `build`: Ogg packaging fixes native/Chromium QA; WebKit
  retains 17 MP3 effect-duration, four Vorbis effect-duration and two music-seam
  failures. Reproduce in the real playback path and propose a playback/format
  contract. `webapp/audio/qa/ogg-pages/README.md` has evidence. Production stays
  blocked; no threshold, format or runtime change made by art.

- 2026-11-14, `art` to `ai` / `build`: Haiku review 06 is in
  `docs/art/concepts/haiku-review-06/README.md`. Prioritise duck/cactus silhouettes,
  identity-bearing detail labels and retaining lantern drafts with run/trial IDs.
  Build should test pose, muzzle alignment and teapot contrast in the real renderer.
  Twelve saved pictures are distinct from newer eval summaries and AI's reported
  36-trial results; no kit-selection comparison has been measured.

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
