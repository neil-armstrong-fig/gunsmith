# TODO: art

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/art`, branch `worktree-art`; last merged main `2347f21` via merge `6f7c38a` on 2026-11-17. Preserve this worktree and sync committed main before new work/delivery.

Current slice: delivered [arena terrain candidates](docs/art/terrain/README.md): three floors and a solid wall, editable SVGs and native/context PNG proofs. User approval and play integration remain pending. Ring damage loop remains delivered; renderer review waits for AI evidence.

Current milestone: M1/M6; the project remains on M1. Next audio task: combat masking, fatigue and levels once AI/play integrate runtime weapon-shot synthesis (not yet wired into the game sound output). Safari acceptance does not claim new headphone/speaker measurements. Preserve approved master hashes. Next failing check for any playback change: the relevant browser sound acceptance criterion before implementation.

## Ownership

webapp/public/assets/, webapp/audio/, asset manifests/loading, authored presentation/overlay components, copy and docs/art/. play owns combat/HUD behavior; AI owns generated renderer and shot synthesis.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Agree manifest keys/anchors with play and supported visual grammar with AI before production assets. The rifle shot is integrated (blue is your unmodified `effects/projectile-rifle`; see HANDOFF.md). No menus ahead of real consumers.

## Current milestone tasks

- [x] Deliver three floor levels and solid-wall SVG candidates with native 64/32 px, repetition, grayscale, dim-terrain and terraced-context proof. Approval and runtime adoption remain open.

- [x] Generate `sfx-ring-damage-loop` for play: separate continuous electrical bed with no impacts or baked-in fades. WAV/MP3 and codec caveat delivered; sound approved in Visual Studio Code; runtime integration remains open.

- [x] Approve the existing matching orange rifle shot (`fx-projectile-rifle-orange.svg`) as selected by the user on 2026-11-17. Native 64/32 px and in-game review pass; keep the 64×64 canvas, current shape/scale, `#FF9B54` and tip (49, 32). The colour mutation was caught by both manifest and browser assertions; the original asset hash was restored. Later weapon classes still need both team variants; muzzle flash remains descoped until feature complete.
- [x] Measure the shipped empty click’s onset/content and event cadence in Chromium/WebKit at default, 44.1 and 48 kHz: 13 starts per 13 holds in all six runs, including repeats shorter than the buffer. WebKit’s main transient is about 12 ms later; no global correction or threshold change. See the audio handoff.
- [x] Accept native Safari audio as good enough by user decision on 2026-11-17; close the onset, first-gesture wake-up and fast-repeat listening follow-up without additional device testing. This records acceptance, not new headphone/speaker measurements.
- [ ] Check fatigue, masking and levels on headphones/speakers once AI/play wire the real weapon-shot synth into runtime audio. The current game output only has the static empty click; general audition approval is not proof of these tests.
- [ ] Map future static cues to approved MP3 as play integrates them; support playback/ducking/volume integration. Weapon-shot synthesis belongs to AI; art supplies static cues. Crunch export and current ring-onset mapping reviewed on 2026-11-17; future outgoing-hit/static cues remain open.
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

- [x] Terrain candidates (2026-11-17): four missing-file reds before artwork; static SVG checks pass. Chromium/WebKit pass 16 native renders and reject a rendered middle-floor recolour. Both sheets visually inspected. `pnpm checks` passes outside sandbox (2,175 tests, one skipped); sandbox audio server setup timed out. Root/webapp standards and folder/caller audit complete; reference/sprite/master hashes preserved. Artwork remains uncommitted; no runtime/manifest change.

- [x] Ring damage loop delivered and approved after listening in Visual Studio Code (2026-11-17); `Listen.html` removed. Five new audio tests pass with red/mutation evidence; eight browser checks pass seam/repeat limits, with WebKit’s 40 ms MP3 padding recorded (use WAV). `pnpm checks` passes: 2,175 tests, one slow render skipped; separate approved-pack re-render passes byte for byte in 308.73 s. All 62 preserved asset/evidence hashes unchanged. Requested root/audio code review and folder/caller audit complete; format duplication and measurement naming fixed. No runtime integration or combat-masking claim.

- [x] Generated-pickup review preparation (2026-11-17): documented the exact lantern/refused review and requested S3 evidence through the connected AI session. Renderer/readability review remains open: S3 is absent. No runtime/assets changed and no new browser, listening or mutation result claimed. `pnpm checks` exits 0 outside the sandbox (2,170 tests, one slow audio render skipped); initial audio run stalled and was stopped. Links/new anchor, diff whitespace and root standards/folder/reference review pass. No new files, folders, helpers or types.

- [x] Crunch MP3/cue mapping review (2026-11-17): play’s pending export matches canonical encoding; native duration/probe/PCM pass, three negative controls rejected. No audio/runtime changes. `pnpm checks` exits 0 (2,170 tests, one slow audio render skipped); standalone handover formatting warning predates this slice, new section formatted. Root/webapp/audio standards and folder/reference audit complete; no new files/helpers/types/folders. Next audio QA still needs runtime shot synthesis; renderer review waits for AI’s drawing.

- [x] Safari audio accepted as good enough by user decision (2026-11-17); closed native listening follow-up and updated active status/guidance. No new listening or device measurements. `pnpm checks` exits 0: lint/format/types and 2,170 unit tests pass, one slow audio render skipped. All 56 local documentation links, the new acceptance anchor, diff whitespace and approved master/runtime MP3 hashes pass. Re-read root/webapp/audio instructions; standards and folder/reference audit complete, with no new files, folders, helpers or types. Next audio QA awaits AI/play runtime weapon-shot synthesis.

- [x] Runtime timing follow-up: twelve production-preview empty-click acceptance cases pass (six each in Chromium/WebKit); six real-play probe runs and six synthetic diagnostic controls completed. All 69 inventoried audio/evidence files retain their hashes. `pnpm checks` exits 0: lint/format/types and 2,170 unit tests pass, with one slow audio render skipped. Re-read root/webapp/audio/acceptance instructions; standards and folder/reference audit complete (no new tracked files, folders, helpers or types).

- [x] Orange-shot review: all 16 `DrawingTheShots` criteria pass on a production build. A temporary blue recolour fails the opponent-orange criterion (0 of 6 orange samples) and exactly one of 13 manifest tests. Native 64/32 px plus in-game screenshots reviewed, including fog and missing-asset fallback. Evidence: `/private/tmp/gunsmith-art-shot-review/` (local, temporary). `pnpm checks` passes: lint/format/types and 2,170 unit tests, with one slow audio render skipped. Standards review re-read root, webapp and acceptance instructions; folder/reference audit complete, with no new tracked files, folders, helpers or types.

- [x] Session 1: [browser listening and live-playback handoff](webapp/audio/qa/runtime-playback/README.md) delivered; MP3 confirmed. Removed the completed listening page, seven one-off JSON files and temporary probes at the user's request. Preserve the decision, original audio and existing codec QA; Safari onset/cadence and production mapping remain open.
- [x] Session 1: lock in MP3 and switch the integrated empty click at the user’s request. Approved WAV masters and codec evidence remain unchanged. Production-preview sound acceptance passes in Chromium/WebKit; project checks and full master re-render pass.

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
