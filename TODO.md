# TODO: the north star path

The shared path all three personas feed. Each persona keeps their own checklist (`TODO-build.md`, `TODO-ai.md`,
`TODO-art.md`); this file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session)

1. Read root `AGENTS.md`, this current status/blocker board and `HANDOFF.md`.
2. Read your own checklist's current resume section and the tasks in scope. Read other persona checklists only for dependencies; historical archives are optional task references.
3. Before editing code, explicitly read every applicable package and nested `AGENTS.md` in full. Starting Codex at the repository root does not automatically load package instructions. Never assume a file was loaded; recover any truncated instruction read in smaller sections.
4. Say which milestone is current, what the other personas are doing or waiting on, and what you will do. Use this board for their current status.
5. Finish by updating your checklist, current status and blockers, and adding a concise delivery to `HANDOFF.md`. Move detailed historical narratives to `docs/history/`; keep current decisions and unfinished tasks visible.
6. Report actual verification results. A standards review must name the instruction files and include the folder/caller audit; it is separate from lint and test results.

Start a session with: **"You are build|ai|art, continue the TODO."**

## Status board

Update the one-line status for your persona at the end of each session.

| Persona | Checklist | Current focus | Last updated |
| ------- | --------- | ------------- | ------------ |
| `build` | `TODO-build.md` | M1: playable best-of-three, vision, crouch, heights, ring and reticle delivered. Current resume and validation details are in the build checklist. **Weapon pickups slice 1 delivered 2026-11-16, uncommitted** (`engine/src/pickup/`: one weapon lies in the duel and sparring as near as can be to equally far from both fighters, walk onto it to equip it in slot 2; the hook's `pickup`; specs `PickingUpAWeapon` and `APickupEachRound`; engine 823, webapp 248, 160 specs; `webapp/audio` tests now on vitest); stairs/bot work is in a separate build session, and the bot using pickups waits on it; art integrations remain queued. Codex standards/configuration hardening delivered; see the current handoff for verification and pickup-suite limitations. | 2026-11-16 |
| `ai` | `TODO-ai.md` | Weapon pipeline and accepted appearance generation are merged through `11f7f45`; integration remains open. [2026-11-15 AI handoff](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15): separate stats/appearance calls, five maximum; combined estimate $1.06 per 1,000 weapons, roughly three times stats alone, to measure end to end. Preserve cumulative eval spend (about $0.4674 of $1 in the old worktree) before paid runs from main. AI coding session implements; Codex documents/reviews. Schema moves to shared only with a renderer consumer; stat balancer follows integration. **Research 2 delivered [stat-balancing study](docs/ai-stat-balancing.md): preserve deliberately weak weapons under a power ceiling; compare omitted-stat policies before choosing. Resume docs/review from new evidence or a preference-probe brief; runtime/calibration remain open.** | 2026-11-16 |
| `art` | `TODO-art.md` | Art/research session 1 delivered [fair symmetrical arenas](docs/art/arena-fairness-research.md): four SVG/PNG layouts, measured routes/ring diagnostics and build/AI acceptance handover. Recommend rotation/shared platform first; user chose matching spawn pairs and unchanged random ring centres. Runtime and paired playtests remain build work. Combat-feedback and empty-click handovers ready; approved audio preserved; M2/codec blockers open | 2026-11-16 |

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

- 2026-11-16, user via `build` to `art`: investigate an **inventory display**, how the HUD shows which guns the player has (a per-weapon icon in `ui-slot-1`/`ui-slot-2`, empty, selected, reloading and out-of-ammo states), and what `build` would need in the state hook. Queued in `TODO-art.md`; study and recommendation only, no manifest key yet.

- 2026-11-16, `art/research 1` to `build` / `ai`: [arena fairness handover](docs/art/arena-fairness-research.md)
  is ready. Begin with rotational shared-platform fixture A, test first; validate
  transformed heights/stairs, matching spawn pairs and clearance, and close the
  stair-flank loophole. User chose matching spawn pairs and preserved the current
  random ring centres; weapon placement remains random. Ring escape measurements
  are diagnostics, not centre filters. Built-ins use the same structural checks;
  paired human playtests and tactical review remain open. No schema is frozen.

- 2026-11-16, `art` to `build`: [combat-feedback handover](docs/art/concepts/combat-feedback/Handover.md)
  is ready. User chose punchy/crunch and retained current shake for tuning during
  build. Agree minimum event/manifest data, implement test-first, preserve fog
  privacy and aiming alignment under shake. No further art-direction approval
  is needed; production playback and weapon-shot masking remain integration work.


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
