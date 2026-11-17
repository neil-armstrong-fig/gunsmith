# TODO: art

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/art`, branch `worktree-art`; created from committed main `6f6b028` on 2026-11-17. Main has not advanced at startup. Sync committed main into the clean worktree before new work and delivery; preserve this worktree. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Current slice: runtime empty-click onset/cadence follow-up delivered in the [audio handoff](webapp/audio/qa/runtime-playback/README.md#runtime-onset-and-cadence-follow-up--2026-11-17). Chromium/WebKit preserve event cadence despite WebKit’s longer decoded buffer and about 12 ms main-transient offset. Approved orange shot, inventory, MP3 and label/policy research are delivered.

Current milestone: M1/M6; the project remains on M1. Next action: native Safari/device listening for onset and fast repeats; combat masking/fatigue waits for runtime weapon-shot synthesis (not yet wired into the game sound output). Native Safari/device-output checks remain human checks; Chromium screenshots do not replace them. Preserve approved master hashes. Next failing check for any playback change: the relevant browser sound acceptance criterion before implementation.

## Ownership

webapp/public/assets/, webapp/audio/, asset manifests/loading, authored presentation/overlay components, copy and docs/art/. play owns combat/HUD behavior; AI owns generated renderer and shot synthesis.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Agree manifest keys/anchors with play and supported visual grammar with AI before production assets. The rifle shot is integrated (blue is your unmodified `effects/projectile-rifle`; see HANDOFF.md). No menus ahead of real consumers.

## Current milestone tasks

- [x] Approve the existing matching orange rifle shot (`fx-projectile-rifle-orange.svg`) as selected by the user on 2026-11-17. Native 64/32 px and in-game review pass; keep the 64×64 canvas, current shape/scale, `#FF9B54` and tip (49, 32). The colour mutation was caught by both manifest and browser assertions; the original asset hash was restored. Later weapon classes still need both team variants; muzzle flash remains descoped until feature complete.
- [x] Measure the shipped empty click’s onset/content and event cadence in Chromium/WebKit at default, 44.1 and 48 kHz: 13 starts per 13 holds in all six runs, including repeats shorter than the buffer. WebKit’s main transient is about 12 ms later; no global correction or threshold change. See the audio handoff.
- [ ] Finish native Safari/device listening for perceived onset, first-gesture wake-up and interrupted fast repeats; record browser/rate/output details. This does not block approved MP3 integration.
- [ ] Check fatigue, masking and levels on headphones/speakers once AI/play wire the real weapon-shot synth into runtime audio. The current game output only has the static empty click; general audition approval is not proof of these tests.
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

- [x] Runtime timing follow-up: twelve production-preview empty-click acceptance cases pass (six each in Chromium/WebKit); six real-play probe runs and six synthetic diagnostic controls completed. All 69 inventoried audio/evidence files retain their hashes. `pnpm checks` exits 0: lint/format/types and 2,170 unit tests pass, with one slow audio render skipped. Re-read root/webapp/audio/acceptance instructions; standards and folder/reference audit complete (no new tracked files, folders, helpers or types).

- [x] Orange-shot review: all 16 `DrawingTheShots` criteria pass on a production build. A temporary blue recolour fails the opponent-orange criterion (0 of 6 orange samples) and exactly one of 13 manifest tests. Native 64/32 px plus in-game screenshots reviewed, including fog and missing-asset fallback. Evidence: `/private/tmp/gunsmith-art-shot-review/` (local, temporary). `pnpm checks` passes: lint/format/types and 2,170 unit tests, with one slow audio render skipped. Standards review re-read root, webapp and acceptance instructions; folder/reference audit complete, with no new tracked files, folders, helpers or types.

- [x] Session 1: [browser listening and live-playback handoff](webapp/audio/qa/runtime-playback/README.md) delivered; MP3 confirmed. Removed the completed listening page, seven one-off JSON files and temporary probes at the user's request. Preserve the decision, original audio and existing codec QA; Safari onset/cadence and production mapping remain open.
- [x] Session 1: lock in MP3 and switch the integrated empty click at the user’s request. Approved WAV masters and codec evidence remain unchanged. Production-preview sound acceptance passes in Chromium/WebKit; project checks and full master re-render pass.

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
