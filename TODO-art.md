# TODO: art

Model: **Codex**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/art`, branch `worktree-art`. The latest validated code merge on main is `08dd9f3` on 2026-11-18. Preserve this worktree and sync committed main before new work/delivery.

Current slice: the same weapon texture draws in hand and on the ground in local play. Default rifle, marksman rifle and SMG use authored sprites. The generated lantern follows the sparring pickup into the loadout. Ship’s inventory identity (`6795b56`) is on main. The next failing criterion is seeing the correct room weapon before and after switching in a two-browser test, with separate fog coverage. AI and Engine still own the production appearance association. For S4-1, recheck the refused pickup's body and outline separately from its muzzle at 64 and 32 px per tile once AI delivers the contrast change.

The [approved stair treatment](docs/art/terrain/README.md#playable-stair-preview) draws in every arena. Art reviewed the opposing stairs in `fair-duel` and the wall-side landing in `terraced` at 64 and 32 px per tile.

Current milestone: M1/M6; the project remains on M1. Next audio task: combat masking, fatigue and levels once AI/play integrate runtime weapon-shot synthesis (not yet wired into the game sound output). Safari acceptance does not claim new headphone/speaker measurements. Preserve approved master hashes. Next failing check for any playback change: the relevant browser sound acceptance criterion before implementation.

Ship's inventory HUD, local pickup cue and ring loop are integrated (`c372d86`). The integrated review is complete in `worktree-ship`, coordinated with Art. The submachine gun's magazine is still faint at 34 px. Status badges and generated thumbnails remain future work.

## Ownership

webapp/public/assets/, webapp/audio/, asset manifests/loading, authored presentation/overlay components, copy and docs/art/. play owns combat/HUD behavior; AI owns generated renderer and shot synthesis.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Agree manifest keys/anchors with play and supported visual grammar with AI before production assets. The rifle shot is integrated (blue is your unmodified `effects/projectile-rifle`; see HANDOFF.md). No menus ahead of real consumers.

## Current milestone tasks

- [x] User chose C2 soft octagon after two marker comparisons. Lock artwork, clean rejected studies and integrate the marker with pickup rendering and browser coverage.

- [x] Complete S4 generated-pickup review at native 64/32 px with hide/restore checks. Lantern passes; S4-1 fallback readability fix is handed to AI. After C2 approval, redundant review artifacts were removed by user request; the approved proof embeds its source images. Broader schema/oddity review stays open.

- [x] Deliver three floor levels and solid-wall SVG candidates with native 64/32 px, repetition, grayscale, dim-terrain and terraced-context proof. User approved all four on 2026-11-18. All four now draw in the game.

- [x] Deliver the approved `sfx-ring-damage-loop` and wire its WAV into local play. The runtime delivery is integrated from `worktree-ship` (`c372d86`).

- [x] Wire the audio pack's `sfx-pickup` MP3 into local play and cover the actual collection, opponent collection, mute and ordinary slot switching.

- [x] Review the integrated inventory HUD, ring loop and pickup cue in the production build.

- [x] Approve the existing matching orange rifle shot (`fx-projectile-rifle-orange.svg`) as selected by the user on 2026-11-17. Native 64/32 px and in-game review pass; keep the 64×64 canvas, current shape/scale, `#FF9B54` and tip (49, 32). The colour mutation was caught by both manifest and browser assertions; the original asset hash was restored. Later weapon classes still need both team variants; muzzle flash remains descoped until feature complete.
- [x] Measure the shipped empty click’s onset/content and event cadence in Chromium/WebKit at default, 44.1 and 48 kHz: 13 starts per 13 holds in all six runs, including repeats shorter than the buffer. WebKit’s main transient is about 12 ms later; no global correction or threshold change. See the audio handoff.
- [x] Accept native Safari audio as good enough by user decision on 2026-11-17; close the onset, first-gesture wake-up and fast-repeat listening follow-up without additional device testing. This records acceptance, not new headphone/speaker measurements.
- [ ] Check fatigue, masking and levels on headphones/speakers once AI/play wire the real weapon-shot synth into runtime audio. The current game output only has the static empty click; general audition approval is not proof of these tests.
- [ ] Map future static cues to approved MP3 as play integrates them; support playback/ducking/volume integration. Weapon-shot synthesis belongs to AI; art supplies static cues. Crunch export and current ring-onset mapping reviewed on 2026-11-17; future outgoing-hit/static cues remain open.
- [ ] Review the visual-schema proposal with AI and engine; validate supported oddities in top-down compositions at 64/32 px using the agreed grammar.

## Later tasks

- [ ] Add overlays only as a spec needs them: pause/settings, pre-round generation/reveal, library, account and rooms. Do not rebuild the abandoned screen map wholesale. Coordinate state/actions with play, AI and server.

- [x] Draw the authored default rifle in local play with stance, aim, equip, fallback and fog coverage.
- [x] Draw Ship’s SMG artwork for the local ground pickup through AI’s existing pickup plane.
- [x] Use the same weapon texture for both placements. Verify the marksman optic, the SMG stripe and generated lantern after collection.
- [ ] Use inventory identity for weapon rendering in rooms and cover it in two browsers.
- [ ] Pickup glow, projectiles/muzzle flashes by supported behavior, hit/death effects.
- [x] Draw paired stair landings and height edges in `?scenario=terrain` for playable review.
- [x] Review the stair treatment for adoption in other arenas at both play scales.
- [x] Adopt the stair treatment in other arenas with browser coverage for opposing stairs and the wall-side landing.
- [ ] Penetrable cover, spawn markers and fog texture.
- [ ] Revisit closing-ring visuals after MVP, per the user.
- [x] Publish the three [approved inventory icons](docs/art/concepts/inventory-display/README.md#weapon-artwork-and-prompt-built-identities) and their lookup for Play.
- [x] Wire the built-in icons into the live HUD and cover starting slots, switching and the pickup with browser criteria.
- [ ] Remaining HUD and overlay art includes slot status badges, health/ammo/credit UI, panels/buttons, prompt styling, power gauge, pipeline progress and reveal frame.
- [ ] Landing/practice/onboarding/prompt copy and example prompts for datasets, including weak, broken and harmless adversarial-looking requests; rejection/errors, AI-off and credit explanations.
- [ ] Privacy/terms copy consistent with `docs/privacy-and-data.md`.
- [ ] Logo, favicons, social preview and README banner.
- [ ] Case-study diagrams: pipeline, cost safeguards and eval loop.

## Verification/latest delivery

2026-11-18, integrated HUD and local cues reviewed in `worktree-ship` at
`afc2092`. Chromium and WebKit kept the 320 × 104 px panel 16 px from the
bottom and left at 1280 × 720 and 1920 × 1080. Rifle, marksman rifle and
submachine gun showed 12/36, 5/15 and 30/60 respectively. The selection
underline was visible in grayscale. The submachine gun's magazine remained
faint, while the silhouette was distinguishable from the rifle.

The pickup started and ended once per collection in both engines. The ring
held one WAV loop across a repeat, ended on mute, restarted on unmute and
ended at round loss, with 100 ms gain ramps. Both built audio files matched
their approved sources byte for byte. At 44.1 kHz, the ring decoded one sample
short of two seconds in Chromium and exactly two seconds in WebKit. Pickup
buffers were 380 ms and 408 ms respectively. Device listening remains open
until runtime shot synthesis is integrated.

The production build and all 55 focused Chromium criteria passed. The
repository gate passed lint, formatting, strict types and 3,253 tests, with
one existing slow audio render skipped. The sandboxed first runs hit loopback
EPERM and passed with loopback access. The standards review covered root,
webapp, React, audio and acceptance instructions. The folder and caller audit
found no new files, helpers or types. Captures and playback measurements are
in `/private/tmp/gunsmith-ship-art-review.vgXMRq/`.

2026-11-18, shared weapon drawing in `worktree-art`. All four new
appearance criteria went red on the prior build. Removing the marksman
SVG from an isolated build failed both optic criteria. Reviewed Chromium
captures of the same SMG and lantern artwork on the ground and after
collection. The rifle and marksman swap passed at 64 and 32 px per tile
after widening the violet optic stripe and sampling its antialiased edge.
All 75 focused browser criteria passed. `pnpm checks` passed with
3,043 tests and one existing slow audio render skipped. Root, webapp,
React and acceptance instructions were reviewed and the folder and caller
audit was completed.

2026-11-18, built-in ground SMG in `worktree-art`. The stripe criterion
found zero mint samples against the original disc. The first screenshot of
the SMG showed the stripe between sample rows, so the check now recognises
the antialiased mint separately from the brighter disc. Removing the asset
from an isolated build reproduced the expected failure. All 50 focused
browser criteria passed, covering collection, fog, missing sprite files,
the existing generated fixtures and the held rifle. `pnpm checks` passed
with 3,042 tests and one existing slow audio render skipped. Root, webapp,
React and acceptance instructions were reviewed and the folder and caller audit
was completed.

2026-11-18, held rifle on main baseline `963a09d`. Eight direction/scale criteria failed before the rifle was drawn. Removing the equipped-weapon check in an isolated bundle failed the two switch-away criteria. Production preview passed 56 fighter, held-rifle and projectile criteria. Chromium captures at 64 and 32 px per tile cover standing, crouching and firing. The body hand remains visible over the rifle. `pnpm checks` passed lint, format, strict types and 3,041 tests, with one existing slow audio render skipped. Re-read root, webapp, React and acceptance instructions and completed the folder and caller audit. The next failing criterion for rooms is seeing the correct rifle before and after switching once the inventory identity reaches main.

2026-11-18, stair rollout in `worktree-art` on main `963a09d`. All eight
new production criteria failed first on the old renderer. Four isolated
bundles triggered their expected failures at both scales. The preview gate
failed six criteria, the west-tread direction failed two, short rails failed
four, and wide drops failed two. The first regression run caught a one-level
rasterisation difference on a 32 px rail sample. With a two-level tolerance
in that assertion, the production rerun passed all 73 criteria without retries.
`pnpm checks` passed lint, formatting, strict types and 3,040 tests, with one
existing slow audio test skipped. Re-read the root, webapp, React and
acceptance instructions and completed the folder and caller audit. Four
Chromium captures and validation logs are in
`/private/tmp/gunsmith-stair-rollout.7HNGmD/`.

2026-11-18, stair motion review on merged main `963a09d`. At both 64 and
32 px per tile, the player crossed both flights in both directions. The
treads and rails framed the open route, and the drop lip and shadow stayed
distinct from it under fog. All 34 focused Chromium criteria passed without
retries. `pnpm checks` passed lint, formatting, strict types and 3,040 tests,
with one existing slow audio test skipped. The review changed coordination
docs only. The folder and caller audit found no new files, helpers or types.
Captures and traversal recordings are in `/private/tmp/gunsmith-art-stairs-963a09d/`.

2026-11-18, local pickup cue in `worktree-ship`. The engine event and browser
audio start both failed before implementation. Production preview passed
64 Chromium criteria and all four pickup sound criteria in WebKit. Duplicate
playback and opponent-triggered playback mutations each failed one intended
criterion. `pnpm checks` passed lint, formatting, strict types and 3,051
tests, with one existing slow audio test skipped. Properties passed 35/35
across engine, browser and API. The runtime MP3 matches the
audio pack byte for byte. A 44.1 kHz in-game buffer capture measured 380 ms
in Chromium and 408 ms in WebKit. WebKit's active portion was shifted about
12 ms later using 1 ms RMS windows at −45 dBFS. Device listening remains
open. The separate standards review covered root, engine, webapp, React,
audio and acceptance instructions and included a folder and caller audit.

2026-11-18, live inventory HUD in `worktree-ship`. All four new browser
criteria failed against the old HUD, then passed after wiring. Fixing slot 2
to the marksman icon temporarily failed both pickup criteria and passed
both starting-loadout criteria. The correct lookup was restored. Chromium
review confirmed the starting, switched and pickup states in a 320 × 104 px
panel. Production preview passed 49 criteria without retries, including
HUD, reload, pickup, reticle and room scenarios. `pnpm checks` passed lint,
formatting, strict types and 3,046 tests with one existing skip.
`pnpm test:properties` passed all 35. The standards review covered root,
engine, webapp, React and acceptance instructions. The folder and caller
audit put the slot component beneath `AmmoHud` and its data types in their
own domains' `types/` folders.

2026-11-18, inventory icons in `worktree-ship`: all three asset criteria
failed first on unresolved URLs and then on missing SVGs. All four lookup
and asset checks passed with the approved files. Production preview served
all three SVGs byte for byte and passed 31 ammunition HUD and pickup
criteria. Chromium review at 34 px in colour and grayscale found the
submachine gun's magazine hard to see against the study slot colours.
The approved source is preserved. `pnpm checks` passed lint, formatting,
strict types and 3,046 tests, with one existing audio render skipped.
The sandboxed check could not open a loopback listener and passed with
loopback access. Root and webapp instructions were re-read and the folder
and caller audit found one asset lookup with its test and no loose helpers
or types. [Inventory handover](docs/art/concepts/inventory-display/README.md#weapon-artwork-and-prompt-built-identities).

2026-11-18, playable stair preview in `worktree-art` at `f16c414`: eight
visual criteria failed against the original renderer. The final production
preview passed all 30 terrain, traversal and cross-level sight criteria.
Four isolated bundle mutations triggered both intended size checks each.
The wider run twice passed 33 of 34, with the known `ShootingAcrossLevels`
timeout. The focused shooting rerun passed all four criteria. Chromium
captures at 64 and 32 px per tile were visually reviewed. `pnpm checks`
passed lint, formatting, strict types and 2,814 tests, with one existing
slow audio test skipped. Root, webapp, React and acceptance instructions
were re-read and the folder and caller audit was completed. Main advanced
to `09d2e60` while this slice was in progress. The preview is integrated from `89e3851`.

2026-11-18, runtime terrain: four production-preview criteria failed against
the flat renderer at 64 and 32 px per tile. All 11 terrain and 13 pickup
drawing criteria passed after integration. The fog mutation revealed 1,930
changed samples in each of two criteria, and the collection mutation revealed
2,166 in its criterion. The production bundle was restored. Full production preview had 310 passes
and one failure in `DrawingTheShots`: the shot had expired before the state
assertion. The two shot criteria passed 20/20 focused repetitions on both the
terrain build and the original `e8c8668` build. The full-run timing failure did
not recur in those comparisons or the managed preview rerun of the failed criterion. `pnpm checks`
passed lint, formatting, strict types and 2,810 unit tests, with one existing
slow audio test skipped. Standards review re-read root, webapp, React and
acceptance instructions and audited folder contents and callers. The ground
texture hook sits beneath `ArenaWalls`, the terrain preview has its own domain,
and the acceptance request type sits in `types/`.

2026-11-18, runtime marker: production build and 78/78 pickup and sprite
criteria passed without retries. All 13 marker and generated-drawing criteria
passed again after moving the screenshot helpers. Before implementation, all
three placement checks reported zero corners. Temporary production bundle
mutations repeated those failures, exposed 792 fog and 909 post-collection
sample points, and removed the lantern's pale core with its marker intact.
Chromium 64/32 px captures confirmed the outline stays above a valid
corner-filling drawing.

`pnpm checks` passed lint, formatting, strict types and 2,805 unit tests,
with one existing slow audio test skipped. Standards review used root, webapp,
React and acceptance instructions. Folder and caller audit placed pickup-only
sampling under its Playwright caller and the result type in `types/`.
The pickup marker is integrated from `e8c8668`.

Cleanup validation: `pnpm checks` exits 0 (lint, formatting, strict types and 2,567 tests; one existing audio-render skip). Approved C2 source/proof retained, with all five proof images embedded. Root instructions re-read; folder/caller, link, SVG geometry and whitespace audit complete. Redundant review artifacts removed from disk and staging; S4-1 finding retained in HANDOFF.md. No gameplay change or acceptance rerun. The artwork is on main in `6186476`.

2026-11-18 ring audio: browser red showed zero loop starts. The mute criterion rejected a build with loop cancellation removed. The runtime and production WAVs match the approved master. `pnpm checks` passed lint, formatting, strict types and 3,038 tests, with one existing slow audio render skipped. Managed production preview passed all 348 criteria. One earlier focused HUD bracket mismatch passed in the full run and three baseline repetitions. The folder and caller audit placed the loop voice type under its Web Audio caller's `types/` folder. Delivery awaits review in the Ship worktree.

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.

S4 validation before cleanup: production build and 6/6 pickup criteria passed without retries. S1/S3 red/mutation evidence is inherited from `c11dc27`, not repeated. No runtime helpers/types/scripts added; the retained handoff records the unresolved AI defect.
