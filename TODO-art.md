# TODO: art

**MVP audio checklist complete.** Art owns authored audio cues, playback integration with Play, and the listening review after weapon-specific shot synthesis. Checkout: `worktree-art`, last upstream commit merged `d05b1e0`.

## Resume next — private generation history

Start in `.claude/worktrees/art` (`worktree-art`). The signed-in arena workshop is on GitHub main at the validated sync `2829a0a`. The local arena history slice uses the Server and AI contract in [HANDOFF.md](HANDOFF.md#mvp-ownership-and-handoffs). Next, agree a production privacy check with AI and add failing route tests for blocked requests, timeouts and weapon attempts with Server.

- [x] Prove local arena history with fake verdicts and real D1. Both first tests failed on an empty history table before route wiring and passed afterward. The route records repaired and first-pass outcomes, omits text without clearance and counts built-in substitutes as failures. Internal reads enforce the 14-day cutoff, the daily sweep purges expired rows, and account deletion cascades. Capture remains limited to the test fixture.
- [ ] Extend to weapons and the other attempt outcomes. Keep a private history separate from the library for authenticated, well-formed Make requests. Record the item type, timestamp, pipeline version, first-pass success, repaired success, rejection, blocked request or failure. Capture a structured failure stage and reason, count code and model repairs, and classify a substitute as a failed generation. Keep the existing credit rules.
- [ ] Store verbatim text only when the judge accepts the prompt as a relevant weapon or arena request and a separate privacy check clears it. Keep outcome metadata when the prompt is rejected, has not been judged, or is flagged for identifiable or sensitive information. Keep prompt text out of ordinary logs.
- [ ] Start with 14-day retention, hide expired records from review, purge through the daily Worker sweep, and erase with the account. Restrict access to authorised maintainers and support access, objection and erasure requests. Internal pipeline tuning is the purpose.
- [ ] Art adds an upfront notice beside Make and updates the [privacy design](docs/privacy-and-data.md). Explain the tuning purpose, retention, rights, and separate storage of prompts attached to generated items. Public text collection stays off until the legitimate interests and children's impact assessments support it and the notice is live. The game may be used by minors. Verify with fake models and local D1 before rollout. [Server history TODO](TODO-server.md#mvp-priority) · [AI diagnostics TODO](TODO-ai.md#current-milestone-tasks).

## Signed-in workshop

Art owns browser sign-in, workshop generation and trials, and the account shelf in `.claude/worktrees/art` (`worktree-art`). Reuse the workshop components and existing previews. Server owns the API and persistence. Coordinate shared acceptance DSL and shelf selectors with Play in [HANDOFF.md](HANDOFF.md#mvp-ownership-and-handoffs) and hand Play server item IDs for room selection.

- [x] `SavingAnArenaToTheAccount` makes an arena through a deterministic signed-in API fixture, previews and walks it, saves it by server ID, reloads, and walks it from the account shelf. All three criteria failed against the browser stand-in and passed after wiring.
- [ ] Extend to weapons using Engine's saved-item parser (`2f5cb87`) and Server's pre-round hookup (`12bb794`). Use generated `visionDegrees` and `visionRange` from `21cc021`; Engine falls back to rifle vision for older saved weapons.
- [x] Saved arena rows preview the stored terrain on both the account and browser-local shelves after reload.
- [x] A signed-in player sees that arena generation is paused and can still walk a saved arena.
- [x] Show the API reason on the current arena fallback result.
- [ ] When the generation contract changes, show why the requested weapon or arena failed, with the refund when applicable, and leave the workshop ready to retry. Keep built-ins available as explicit choices. [AI](TODO-ai.md#current-milestone-tasks) and [Server](TODO-server.md#mvp-priority) own the outcome and refund.
- [ ] Next acceptance criterion: a signed-in player with no credits sees the credit refusal and can still walk their saved arena. Then cover the pending, rejection and timeout states. The guest built-in pre-round passed in the production suite.

Engine's built-in list `00ff548`, the saved-item parser and Server's pre-round hookup are on GitHub main.

## Handoff

- **Play** takes the arena preview and workshop presentation, authored gameplay and UI assets and their manifests, and player-facing copy. Engine supplies terrain and combat rules, and Budget supplies credit and AI-off behavior.
- **AI** takes the S4-1 fallback contrast fix and native-size re-review, generated appearance and shot synthesis, and dataset prompt examples. Engine helps review the appearance association with runtime weapon identity.
- **Server** takes privacy and terms copy for accounts and player data. **Ship** takes release branding, publication and case-study visuals.

## Delivered work

The earlier Art development tip `52443a3` is on GitHub main. The local arena workshop (`17d3ae8`), the weapon shelf replacement picker (`8c0adef`) and the 12-study appearance review (`a748da3`) are integrated.

The local workshop's full-shelf replacement picker is committed at `8c0adef`. `SavedWeaponSummary` supplies the thumbnail, name, power rating and prompt for both the shelf and `ReplacementChoice`. `TheWeaponShelf` checks distinct prompts on identical stand-in weapons and replacement in place.

At the user's request Art built the local arena workshop reference while Play was unavailable. The Arenas tab takes up to 1,000 characters and uses Make to preview one of two labelled stand-ins. Walk it opens the arena and Return to practice restores the previous range. The separate three-place browser shelf supports Save, Walk it, Iterate, Delete and replacement. It keeps the source rows and the prompt used to make them. The signed-in flow reuses the card and trial with account-backed generation and saves. At capacity, the player deletes an arena explicitly before saving.

Room weapon art and its two-browser spec are integrated. The user's approved low-cover artwork from `837f1d9` is integrated in `adbf7b4`.

The workshop weapon result card now has the authored picture beside the name, a power meter and six compact stat rows. Integrated from `457ba87` via `3912cb1`, alongside Play’s Try it action.

The workshop arena preview is integrated from `a091b3e` via `eeb19d3`. The built-in pool supplies Duel and Fair duel. The match and preview render the same terrain through React Three Fiber. Reuse the preview for future pre-round choices.

The [runtime grammar review](docs/art/concepts/top-down-oddities/README.md#runtime-grammar-review--2026-11-20)
covers all twelve studies at 64 and 32 px per tile. The evidence is ready for AI and Engine to review
for production appearance association. Keep a defining structural feature outside the fighter's silhouette.

AI and Engine own the production appearance association. For S4-1, recheck the refused pickup's body and outline separately from its muzzle at both scales once AI delivers the contrast change.

The [approved stair treatment](docs/art/terrain/README.md#playable-stair-preview) draws in every arena. Art reviewed the opposing stairs in `fair-duel` and the wall-side landing in `terraced` at 64 and 32 px per tile.

Art and Play's next audio review is combat masking, fatigue and levels once runtime weapon-shot synthesis is integrated. The user accepted Safari playback on 2026-11-17. Headphone and speaker measurements remain open. Preserve approved master hashes and write the relevant browser criterion before any playback change.

Ship's inventory HUD, local pickup cue and ring loop are integrated (`c372d86`). Art followed up on Ship's review with a lighter fill on the built-in submachine gun's magazine at 34 px. The delivery covers the authored SVG pair and the HUD browser criteria. Ship integrated generated thumbnails for local fixtures. Status badges and production appearance association remain open.

## Milestone checklist

Art owns the audio entries. The remaining entries follow the handoff above.

- [x] Style the existing workshop weapon result card using the selection concept. Check that the meter and printed power rating agree for successive results.

- [x] Draw workshop arena previews from the engine's built-in Duel and Fair duel using the shipped tile artwork and stair geometry.

- [x] Show authored thumbnails and full saved prompts when choosing which weapon to replace on a full workshop shelf.

- [x] User chose C2 soft octagon after two marker comparisons. Lock artwork, clean rejected studies and integrate the marker with pickup rendering and browser coverage.

- [x] Complete S4 generated-pickup review at native 64/32 px with hide/restore checks. Lantern passes; S4-1 fallback readability fix is handed to AI. After C2 approval, redundant review artifacts were removed by user request; the approved proof embeds its source images. Broader schema/oddity review stays open.

- [x] Deliver three floor levels and solid-wall SVG candidates with native 64/32 px, repetition, grayscale, dim-terrain and terraced-context proof. User approved all four on 2026-11-18. All four now draw in the game.

- [x] Deliver the approved `sfx-ring-damage-loop` and wire its WAV into local play. The runtime delivery is integrated from `worktree-ship` (`c372d86`).

- [x] Wire the audio pack's `sfx-pickup` MP3 into local play. Browser coverage distinguishes the player's direct cue from the nearby opponent's panned cue and covers mute and ordinary slot switching.

- [x] Integrate the approved soft footstep for upright walking and the reload MP3 in local play. Crouched movement is silent.
- [x] Play the approved reload cue once for either seat when its own reload starts in a private room. The browser checks cover repeat requests, a full magazine, mute and seat isolation.
- [x] Bring the damage brackets, health trail, camera shake and visible hit ticks to private rooms with Play and Server.
- [x] Clear the ring damage loop, player highlight and health border when the room connection drops. Restore them when fresh server snapshots report ring damage again.
- [x] Ship an authored fallback shot sound for successful local and online shots, including the opponent’s spatial cue.

- [x] Review the integrated inventory HUD, ring loop and pickup cue in the production build.

- [x] Approve the existing matching orange rifle shot (`fx-projectile-rifle-orange.svg`) as selected by the user on 2026-11-17. Native 64/32 px and in-game review pass; keep the 64×64 canvas, current shape/scale, `#FF9B54` and tip (49, 32). The colour mutation was caught by both manifest and browser assertions; the original asset hash was restored. Later weapon classes still need both team variants; muzzle flash remains descoped until feature complete.
- [x] Measure the shipped empty click’s onset/content and event cadence in Chromium/WebKit at default, 44.1 and 48 kHz: 13 starts per 13 holds in all six runs, including repeats shorter than the buffer. WebKit’s main transient is about 12 ms later; no global correction or threshold change. See the audio handoff.
- [x] Accept native Safari audio as good enough by user decision on 2026-11-17; close the onset, first-gesture wake-up and fast-repeat listening follow-up without additional device testing. This records acceptance, not new headphone/speaker measurements.
- [x] Play the damped footfall on upright movement onset and for nearby listeners in local and online play.
- [x] Review all twelve oddities at 64/32 px per tile using the current appearance grammar and renderer.
- [ ] Review Art's findings with AI and Engine as part of production appearance association.

## Later tasks

- [ ] Revisit cue timbre and the combat mix. The user heard a small improvement in the revised reload and hit cues and deferred further tuning. Check fatigue, masking and levels on headphones and speakers once weapon-specific synthesis is integrated.
- [ ] After MVP, decide where players should find References & credits.

- [ ] Add overlays only as a spec needs them: pause/settings, pre-round generation/reveal, library, account and rooms. Do not rebuild the abandoned screen map wholesale. Coordinate state/actions with play, AI and server.

- [x] Draw the authored default rifle in local play with stance, aim, equip, fallback and fog coverage.
- [x] Draw Ship’s SMG artwork for the local ground pickup through AI’s existing pickup plane.
- [x] Use the same weapon texture for both placements. Verify the marksman optic, the SMG stripe and generated lantern after collection.
- [x] Use inventory identity for weapon rendering in rooms and cover it in two browsers.
- [ ] Pickup glow, projectiles/muzzle flashes by supported behavior, hit/death effects.
- [x] Draw paired stair landings and height edges in `?scenario=terrain` for playable review.
- [x] Review the stair treatment for adoption in other arenas at both play scales.
- [x] Adopt the stair treatment in other arenas with browser coverage for opposing stairs and the wall-side landing.
- [x] Replace the low-cover block placeholder with terrain artwork in `?scenario=cover`.
- [ ] After MVP, try omitting braces on the shared edges of adjoining low-cover blocks so a row reads as one barrier.
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

2026-11-22, prompt feedback diagnosis. Root `AGENTS.md` points to `diagnose-generation-prompt`. Its offline checker passed eight cases and the focused arena fixture eval passed all 42 criteria. The history insert uses Drizzle’s query builder and the 41 focused arena route and local D1 tests passed, including the deletion race.

2026-11-22, private arena Make history. The two first route checks failed against the empty migrated history table before wiring and passed afterward. The seven local D1 criteria pass. Two mutations made only the intended privacy-denial and expiry-boundary checks fail. `pnpm checks` passed lint, formatting, type checks and 4,195 tests with one existing audio skip. Fake evals passed 291/291 and API properties passed 22/22. Re-read root, API, AI and the Engine reference and audited folders and callers. Verified from Art’s base `2829a0a`. GitHub main advanced to `e235754` during the slice and its coordination edits overlap this worktree.

2026-11-22, workshop sync. The merge at `2fd8ebb` passed `pnpm checks`, 60 properties and 59 focused Chromium criteria. GitHub then advanced to `f6cdd77`. The final merge `2829a0a` follows the server's updated credit rules and shows the arena fallback reason without a refund claim. `pnpm checks` passed 4,188 tests with one existing audio skip. All 65 properties, 291 fake evals and 36 focused Chromium criteria passed. Reviewed the conflicting instructions and audited the folders and callers for the workshop fixture and fallback adapter.

2026-11-21, arena fallback explanation. The browser criterion failed when the workshop hid the API reason and passed when the result showed it. All 28 focused production Chromium criteria passed. `pnpm checks` passed lint, formatting, strict types and 4,019 tests with one existing slow audio skip. Reviewed root, Webapp, React and acceptance instructions and audited touched folders and callers. The change to the substitution policy is queued above.

2026-11-21, saved arena previews. The account and browser-local drawing criteria failed before the preview was mounted and passed after wiring. Production Chromium passed all 27 arena workshop criteria. The preview wrappers logged teardown errors after the browser run, which exited successfully. The repository gate passed lint, formatting, strict types and 4,019 tests with one existing slow audio skip. Reviewed root, Webapp, React and acceptance instructions and audited touched folders and callers.

2026-11-20, signed-in arenas in `worktree-art` and Engine merge `83837d6`. The initial three browser criteria failed against the stand-in. The AI-off message failed before the dedicated response handling, and a disposable build that suppressed Walk it after a generation error failed the saved-arena criterion. The final five account-arena production criteria passed without retries. The preceding workshop, pre-round and room run passed 123/123. The Engine list tests passed 6/6, the API pre-round and room tests 95/95, and all 55 properties passed. Final `pnpm checks` passed lint, formatting, strict types and 4,019 tests with one existing slow audio skip. Reviewed root, Engine, API, Webapp, React and acceptance instructions and audited touched folders and callers.

GitHub sync combined Art's ring feedback fix `daadb0f` with Ship's account-retention change `27052bc`. `pnpm checks` passed lint, formatting, strict types and 4,013 tests with one existing slow audio-render skip. Chromium production preview passed all three disconnect and reconnect criteria without retries. The preview and Worker reported shutdown errors after the tests, and the command exited successfully.

2026-11-20, private-room ring feedback in `worktree-art` on `4f38a65`. All three browser criteria and the queued-event unit test failed before the fix. Production Chromium passed all 54 focused criteria without retries, with nonfatal WebSocket proxy `EPIPE` messages. `pnpm checks` passed lint, formatting, strict types and 4,012 tests with one existing slow audio-render skip. All 15 webapp properties passed. Reviewed the root, webapp, React and acceptance-test instructions and audited the affected folders and their callers. The next Art task is the listening review after weapon-specific synthesis lands.

2026-11-20, private-room reload and hit feedback in `worktree-art` on `652654a`. All seven original acceptance criteria went red before wiring. A disposable build with both browser hookups disabled failed all five targeted criteria, and suppressing the engine reload event failed the two matching unit assertions. The restored engine tests passed 47/47. The final production-preview Chromium run passed 75/75, including the nine new criteria and the integrated ring and pickup specs. `pnpm checks` passed lint, formatting, strict types and 4,011 tests with one existing audio-render skip. All 55 properties passed. The standards review covered root, Engine, API, Webapp, React and acceptance-test instructions, with a folder and caller audit.

2026-11-20, pickup audio acceptance in `worktree-art`. The opponent criterion failed before the recorder captured stereo pan. In disposable builds, bypassing the panner failed the opponent criterion and adding a centered panner failed the collector criterion. `pnpm checks` passed lint, formatting, types and 3,923 tests with one existing audio skip. The standards review used the root and acceptance-test instructions and audited the existing sound folders and their callers.

Production Chromium passed 38 of 39 audio criteria in each of two runs, with all pickup and two-browser hearing criteria green both times. The west-wall setup failed in the first run and the upright cadence criterion failed in the second. Each passed all three isolated reruns. The west-wall setup also failed once in five runs with the unmodified GitHub-main recorder. Cadence passed all five baseline runs.

2026-11-20, references and Foley revisions in `worktree-art`. The practice range opens a standalone References & credits tab with Greg Lester’s guide. The references criterion failed before wiring and passes without firing a shot. Reload is a dry 0.60 s release, slide and seat. The outgoing hit is a muted 0.092 s contact. Chromium and WebKit decoded both. The audio notes regenerated all four runtime MP3s byte for byte, so the two temporary WAV renders were removed. Production Chromium passed 37 focused criteria and `pnpm checks` passed with 3,923 tests and one existing skip. The References layout was reviewed at 360 px and the folder and caller audit is complete. The revised cues are ready for the user to audition.

2026-11-20, damped footsteps and movement taps in `worktree-art`. Both the local short-tap criterion and Engine’s listener test failed before the change. Production Chromium passed 15 focused browser criteria, including the short-tap listener in an online room. `pnpm checks` passed with 3,923 tests and one existing skip. All 55 properties passed. Chromium and WebKit decoded the new sample at −39.31 and −40.10 dBFS RMS. Art recorded the heel-and-scuff recipe in the audio build notes. The standards and folder/caller audit covered engine, API, webapp, React, audio and acceptance instructions. In-game listening is open.

2026-11-20, softer upright footsteps and shooting in `worktree-art`. Crouched movement is silent. The engine emits a position-free event for a successfully fired shot and the browser plays the authored fallback for both the shooter and the listener. The local and two-browser shot criteria went red before wiring, as did the crouch silence criterion. The upright criterion rejected the wrong clip in a separate build. Production Chromium passed all 32 targeted criteria. The full sound group passed 30 of 31. The sole failure was the previously reproduced opponent-pickup expectation. Chromium and WebKit decoded the shot with a peak of −1.83 dBFS. `pnpm checks` passed with 3,923 tests and one existing audio skip. All 55 properties passed. The folder and caller audit used root, webapp, React, audio, engine, API and acceptance instructions. Review the fallback mix on headphones and speakers, then repeat when weapon-specific synthesis arrives.

2026-11-20, local audio in `worktree-art`. Art merged `c280fbe` as `d93dd90`. The three new positive browser criteria failed before playback was wired. The wall, full-magazine reload and mute criteria each caught a deliberately broken build. `pnpm checks` passed with 3,923 tests and one existing audio skip. All 55 properties passed. Production Chromium passed 42 of 43 focused criteria, including all six new ones. The opponent-pickup failure reproduces on the merge baseline. Chromium and WebKit decoded the three production MP3s with the crouched step about 9 dB quieter than the standing step. Headphone and speaker listening remains open. Reviewed root, webapp, React, audio and acceptance instructions and completed the folder and caller audit.

2026-11-20, runtime appearance review in `worktree-art`. All twelve studies
passed the AI appearance validator and were inspected in the current
structural tier. The lantern and cactus passed the seeded pickup, fog and
held-art checks at 64 and 32 px per tile. Chromium passed all 25 focused
production criteria without retries. `pnpm checks` passed on Node 26.13.1
with 3,741 tests and one existing audio skip. The documentation review
checked the new links and audited the changed folders and references.

The arena and weapon Save controls each delegate their three rendered
states to separate components. Shelf actions stay in the parent.
All 33 focused production criteria and `pnpm checks` passed. The folder
and caller audit confirmed each new component has one parent.

2026-11-20, arena workshop reference in `worktree-art`.
Six `UsingAnArena` criteria failed on the old build before the actions were
implemented. The suite now covers eight criteria, including walking after
a reload and keeping range dummies out of an arena trial. Both of those
criteria failed with the relevant behavior disabled in a disposable build.
The hydration unit test failed with drawing validation removed and passed
after restoring the check. All 86 production workshop criteria passed
without retries. `pnpm checks` passed lint, formatting, typechecks and
3,647 tests with one existing audio skip. Reviewed root, webapp, React and
acceptance instructions and audited the changed folders and callers.

2026-11-20, local arena making in `worktree-art`. Three new
`DrawingAnArenaPreview` criteria failed on the old build because the arena
prompt was absent. All three then passed, covering the off-centre wall,
the raised platform and retained result at 1024 × 560, and the 1,000-character
limit. Moving the wall one tile in a disposable build failed the pixel
criterion. Both layouts pass engine validation. The production preview
passed all 78 workshop criteria without retries. `pnpm checks` passed lint,
formatting, typechecks and 3,646 tests with one existing audio skip.
Re-read the root, webapp, React and acceptance instructions and audited the
changed folders and callers.

2026-11-20, workshop arena result card in `worktree-art`.
`DrawingAnArenaPreview` detected the missing eastern wall brace after
switching from Fair duel to Duel on the original production build.
The check passed with the camera refit, and all 75 workshop criteria passed
on the production preview without retries. The full Fair duel result is
visible at 1024 × 560, 1280 × 720 and 1440 × 900. Both preview wrappers logged
shutdown errors, Playwright exited 0 and both ports closed. `pnpm checks`
passed lint, formatting, strict typechecks and 3,644 tests with one existing audio skip.
Re-read the root, webapp, React and acceptance instructions and audited the
changed folders and callers. Play's generated-arena flow is still pending.

2026-11-20, workshop shelf replacement picker in `worktree-art`.
The prompt criterion failed on the old picker and on a disposable
production build with the picker prompt text removed. All 72 workshop
criteria passed on the production preview without retries. Chromium review
at 1024 × 560 and 1440 × 900 verified loaded thumbnails, full prompts,
accessible descriptions and keyboard replacement. `pnpm checks` passed
lint, formatting, strict typechecks and 3,644 tests with one existing audio
skip. The preview wrapper logged a shutdown error after the tests and the
runner exited 0. Re-read the root, webapp, React and acceptance instructions
and audited the touched folders and callers.

2026-11-19, built-in submachine gun inventory icon in `worktree-art`.
Both new magazine contrast criteria failed before the fill change and
again when the original fill was restored in a disposable production
build. The four identity and selection criteria passed in both runs.
The contrast check uses the clear upper-right padding as its reference
because the slot number can overlap the upper-left pixel.
Reviewed the starting, selected and stowed slots at native size in
Chromium and WebKit, in colour and grayscale. All 101 HUD and pickup
criteria passed on the production preview without retries. `pnpm checks` passed with
3,449 tests and one existing audio skip. Reviewed root, webapp and
acceptance instructions, audited the existing folders and callers,
and verified the editable, runtime and built SVGs match byte for byte.

2026-11-19, selecting a built-in arena now reveals the full result in the
scrollable workshop panel. At 1280 × 720 the old layout hid 43 pixels of
the preview and showed only 78% of the card. The new criterion reproduced
that before the fix. Verified the whole result and its original aspect
ratio at 1024 × 560, 1280 × 700, 1280 × 720 and 1440 × 900, including
reselecting Fair duel after scrolling away. Reviewed the root, webapp,
React and acceptance instructions and audited the existing folders and
their callers. All 40 workshop browser criteria and `pnpm checks` passed,
with 3,502 tests and one existing audio skip in the project gate.

2026-11-19, reused the live terrain renderer for workshop previews. Both
surfaces mount `ArenaTerrain`, which groups the existing walls and
heights. The preview fits the arena with a demand-rendered orthographic
camera. The new WebGL criterion failed on the old preview. Separate
production variants with the floor or wall SVG missing failed their
screenshot assertions. All 72 focused production browser criteria passed.
Reviewed Chromium at 1024 × 560 and 1440 × 900
for square tiles, visible captions, and switching to Duel. `pnpm checks`
passed lint, formatting, strict types and 3,502 tests, with one existing
audio skip. Re-read the root, webapp, React and acceptance instructions and audited the new
Three Fiber component folders and their callers.

2026-11-19, workshop arena previews in `worktree-art` on main baseline
`44873b7`. Four browser criteria failed first on the weapon-only workshop.
Both temporary production faults failed their intended assertions, one
with missing floor and wall artwork and one with Duel drawn in both rows.
The single-worker production preview passed all 71 workshop and terrain
criteria. The four preview criteria passed again after the compact layout
adjustment. Chromium review at 1024 × 560 and 1440 × 900 checked square
tiles, the starting-place caption, and switching the result to Duel.
`pnpm checks` passed lint, formatting, strict types and 3,502 tests,
with one existing audio skip. An earlier engine timeout passed on rerun.
Read the root, webapp, React and acceptance instructions and audited the
added folders and caller counts. Pure terrain geometry and the sprite
loader are shared by the DOM preview and the live arena. Drawing logic
used only by the preview sits beneath that component and its type is in
`types/`. The two files also touched by Play merged cleanly in a read-only
three-way check.

2026-11-19, workshop weapon result card in `worktree-art` at `6fed51d`.
The meter criterion failed on the old card and caught a 50% fixed fill in
a copy of the production bundle. All 23 workshop browser criteria passed
without retries. The preview wrapper logged a shutdown error after the tests,
and the runner exited 0. Both cards were reviewed at 1024 × 560 and 1440 × 900.
`pnpm checks` passed lint, formatting, strict types and 3,467 tests with one
existing audio skip. The standards review used the root, webapp, React and
acceptance instructions. The folder and caller audit confirmed that the new
meter type lives under the workshop DSL's `types/` and its callers stay in
the workshop.

Workshop preview baseline at `44873b7`. The production build and all 67
existing workshop, terrain, stairs and low-cover Chromium criteria passed
on a local preview without retries. `pnpm checks` passed lint, formatting,
strict types and 3,502 tests, with one existing audio skip. Art and Play
were at the weapon-only workshop baseline. That baseline preceded the
arena result, built-in row and deterministic Fair duel result.

2026-11-19, reinforced square in `worktree-art`. The user chose option C.
All four updated drawing criteria failed against the continuous rim.
The new SVG matches the study's geometry and colours. All 10 focused
production-preview criteria passed, covering drawing and cover visibility.
`pnpm checks` passed lint, formatting, strict types and 3,336 tests,
with one existing audio skip. The folder and caller audit found no new
helpers or types.

2026-11-19, square low cover in `worktree-art`. The user asked for the
same profile on all sides. At 64 and 32 px per tile, all four updated
criteria failed on the directional artwork and on the forced 404.
All 10 focused production-preview criteria passed with the square.
`pnpm checks` passed lint, formatting, strict types and 3,336 tests,
with one existing audio skip. Reviewed lit and dim captures and audited
the existing asset and spec folders and callers. Captures are in
`/private/tmp/gunsmith-square-cover.HhpuIW/`.

2026-11-19, low-cover artwork in `worktree-art` at `fb1a739`. All four
new criteria failed on the flat placeholder and passed with the slab.
An isolated 404 settled sprite readiness, drew the fallback at both
scales and failed all four criteria again. Chromium captures at 64 and
32 px per tile were reviewed lit and dim, in colour and grayscale.
The single-worker production run passed 48 criteria without retries.
The first two-worker run passed 47 and failed one existing criterion
while setting up crouch. `pnpm checks` passed lint, formatting, strict
types and 3,336 tests, with one existing slow audio test skipped.
Re-read root, webapp, React and acceptance
instructions and audited the asset, spec and their callers. Captures
and the 404 run are in `/private/tmp/gunsmith-low-cover.5uTViK/`.

2026-11-18, room weapon artwork in `worktree-art`. All five new browser
criteria failed on the original renderer and passed with the identity-key
lookup. An isolated client build that retained the hidden opponent made
the canvas assertion fail while the WebSocket privacy criterion passed.
All 94 focused production-preview criteria passed without retries.
`pnpm checks` passed lint, formatting, strict types and 3,253 tests with
one existing slow audio test skipped. Re-read the root, webapp, React and
acceptance instructions and audited changed folders and callers.

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
