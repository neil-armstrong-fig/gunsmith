# TODO: art

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Review integrated player/dummy art and concrete renderer evidence; continue Safari timing and combat masking QA. Approved inventory, MP3 and label/policy research are delivered.

Current milestone: M1/M6; the project remains on M1. Next failing test/check: Browser drawing/asset fallback tests before presentation changes; listening and native/Retina QA remain human checks. Preserve approved master hashes.

## Ownership

webapp/public/assets/, webapp/audio/, asset manifests/loading, authored presentation/overlay components, copy and docs/art/. play owns combat/HUD behavior; AI owns generated renderer and shot synthesis.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Agree manifest keys/anchors with play and supported visual grammar with AI before production assets. The rifle shot is integrated (blue is your unmodified `effects/projectile-rifle`; see HANDOFF.md). No menus ahead of real consumers.

## Current milestone tasks

- [ ] Draw the real orange rifle shot to replace the stand-in `webapp/public/assets/sprites/fx-projectile-rifle-orange.svg` (the blue file with fill `#FF9B54`). Keep it 64 by 64, the shape's scale and the tip at (49, 32), which the manifest anchors on the bullet's point; no code change is needed. Each later weapon class needs a blue and an orange shot too. The muzzle flash is descoped until feature complete.
- [ ] **Requested by play (2026-11-17):** `sfx-ring-damage-loop`: a **continuous, seamlessly looping** cue for taking ring damage, **not the crunch** (user, 2026-11-17: ring damage is a sustained state, so one impact per exposure feels wrong). Mono 48 kHz, 1 to 2 s, no fades at the ends (play fades it in and out over about 100 ms and holds it while the player is outside the ring and being hurt, which can be 10 s or more); an eroding, unsafe, electrical or radiation-like bed that stays clearly different from `sfx-damage-crunch`, `sfx-ring-warning` and the music; steady with no sharp transients, so it is tolerable for long stretches and does not mask footsteps or gunfire. WAV master in the audio workspace plus an MP3 that passes the existing loop-join checks in Chromium and WebKit (the music loops do; an MP3 effect loop must not click at the seam). Register the key and the file in `webapp/src/assets/sounds/` like the other cues, or tell play the format. Play adds loop start/stop to `WebAudioOutput` and wires it to `damageTaken` with cause `ring`.
- [ ] Follow up Safari onset/content and event cadence during play; this no longer blocks MP3 integration. Preserve existing thresholds.
- [ ] Check fatigue, masking and levels on headphones/speakers with the real weapon-shot synth. General audition approval is not proof of these tests.
- [ ] Map future static cues to approved MP3 as play integrates them; support playback/ducking/volume integration. Weapon-shot synthesis belongs to AI; art supplies static cues.
- [ ] Review the visual-schema proposal with AI and engine; validate supported oddities in top-down compositions at 64/32 px using the agreed grammar.

## Later tasks

- [ ] Add overlays only as a spec needs them: pause/settings, pre-round generation/reveal, library, account and rooms. Do not rebuild the abandoned screen map wholesale. Coordinate state/actions with play, AI and server.

- [ ] Complete remaining held-weapon/default-rifle variants and production polish. Standing/crouched player, opponent and dummy integration already exists.
- [ ] Pickup glow, projectiles/muzzle flashes by supported behavior, hit/death effects.
- [ ] Floor, indestructible wall, penetrable cover, three height levels and paired stairs, spawn/pickup markers, ring edge and fog texture.
- [ ] Runtime HUD/slot assets, health/ammo/credit UI, panels/buttons, prompt styling, power gauge, pipeline progress and reveal frame. Use the approved inventory study rather than treating its standalone artwork as integration.
- [ ] Landing/practice/onboarding/prompt copy and example prompts for datasets, including weak, broken and harmless adversarial-looking requests; rejection/errors, AI-off and credit explanations.
- [ ] Privacy/terms copy consistent with `docs/privacy-and-data.md`.
- [ ] Logo, favicons, social preview and README banner.
- [ ] Case-study diagrams: pipeline, cost safeguards and eval loop.

## Verification/latest delivery

- [x] Session 1: [browser listening and live-playback handoff](webapp/audio/qa/runtime-playback/README.md) delivered; MP3 confirmed. Removed the completed listening page, seven one-off JSON files and temporary probes at the user's request. Preserve the decision, original audio and existing codec QA; Safari onset/cadence and production mapping remain open.
- [x] Session 1: lock in MP3 and switch the integrated empty click at the user’s request. Approved WAV masters and codec evidence remain unchanged. Production-preview sound acceptance passes in Chromium/WebKit; project checks and full master re-render pass.

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
