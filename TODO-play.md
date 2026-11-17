# TODO: play

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Combat feedback and inventory integration. Start with incoming-damage feedback after agreeing engine events.

**State after the 2026-11-17 session (play, formerly build 1):** combat feedback slice 1, the empty-weapon click, is **delivered and committed** (`8acad87`; art's MP3 swap `2970f33` since). The user played it: audible but "a bit abrasive and loud"; tune later, once more sounds are in (gain or a swapped file, with art). What exists, so do not rebuild it: `engine/src/combat-events/` (`EventsOfStep({playerTurn})`, `World.events` for one step only, set on every `step` return, fireRefused for the player only); webapp `src/sound/` (`CombatSounds.afterTick({events, firing, round})` called after **every tick** in `use-game-loop/UseGameLoop.ts`, `empty-click/ClickLatch`, `web-audio/WebAudioOutput`: a sound is dropped, not queued, while the context is suspended), `src/assets/sounds/` (keys, URLs, files), `store/app/` (`muted`; **M** mutes, `?mute=1`), `use-game-loop/hooks/use-combat-sounds/`, a lint boundary for `sound/`, and the acceptance recorder `gunsmith.sound.getPlays(key)` (`SoundPlaywright`: wraps `fetch`, `decodeAudioData`, `AudioBufferSourceNode.start`; added by `GunsmithDsl.begin()`). Read `webapp/AGENTS.md` ("Sounds") and `acceptance-tests/AGENTS.md` ("Sound") before changing it. **Slice 2 is not started.** Its engine half is engine's (below: `damageTaken` with cause, in `combat-events/`; `Step.ts` today sums `bulletFlight.playerDamage + ringDamageTo(...)`, so the cause must be kept apart before the sum); the webapp half is yours: `sfx-damage-crunch` (art's `webapp/audio/studies/combat-feedback/damage-crunch.wav`, 180 ms; agree the file format with art first, since the click went MP3) added to `SOUND_KEYS`/`SoundUrls`, `CombatSounds` cases with a 100 ms coalescer and one voice, a ring-onset cue (one per exposure), coral brackets and the 350 ms health trail in `health-hud/`, cleared on round change; acceptance spec first. Slice 4 will need `ArenaPointAtPixel` and the acceptance `ScreenPositionOfTile` to take the shake offset, and reduced motion (`prefers-reduced-motion`, `?reducedMotion=1`, in `store/app`). **Known gaps, plainly:** the audio context's wake-up on a first press is not proven by any spec (the test Chromium starts audio running whatever flag it is given); no spec covers a hold with no reserve (the engine test does); the build-2 loop priority (`useFrame(cb, -1)`, so drawing sees the current world) lives in a source worktree and must survive the merge of `UseGameLoop.ts`. **Open question for the user:** M has its own `keydown` listener (like `useWeaponKeys`); `useHeldKeys` was judged the wrong fit (a held state; a tap between frames would be lost). If they want less duplication, extract `usePressedKey(code, onPress)` for M and for R/1/2 (touches `useWeaponKeys`, so ask first). Other sessions may be live: check `ListAgents` and `git status` before touching `UseGameLoop.ts`, `HealthHud.tsx` or `Step.ts`. **Resume prompt:** "You are play, continue the TODO: combat feedback slice 2. Read the instruction files, check whether engine has added `damageTaken`, and write the acceptance spec first, watched red. Leave changes uncommitted."

Current milestone: M1; the project remains on M1. Next failing test/check: Browser acceptance: bullet/ring damage feedback, burst merging and health trail; write it first and watch it fail.

## Ownership

Webapp combat HUD, camera feedback, input/screenshot offsets, local sound playback and M1 playtests. Engine produces simulation events; art owns assets/manifests.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Wait for engine event/data changes before consuming them. Independently specify the damage feedback acceptance cases using [the handover](docs/art/concepts/combat-feedback/Handover.md). Coordinate inventory with art.

## Current milestone tasks

- [ ] Combat feedback slice 2: local `damageTaken` (bullet/ring), selected crunch with 100 ms burst merging and one voice, one ring-onset cue, coral brackets and 350 ms health trail.
- [ ] Slice 3: `hitLanded` only for visible targets, `sfx-hit` and mint ticks. Slice 4: camera shake/cosmetic recoil, shared pointer/screenshot offsets and reduced motion. Follow [the handover](docs/art/concepts/combat-feedback/Handover.md).
- [ ] Adopt the approved [inventory display](docs/art/concepts/inventory-display/README.md): two icons, selected name, fixed footprint and pointer pass-through. Agree minimum local inventory/name/icon data before changing the hook or manifest.
- [ ] Add art's pickup glow when a key is agreed. Custom/dropped weapons and variety remain engine work; shot synthesis belongs to AI. Existing pickups equip slot 2, discard its previous weapon and break a simultaneous claim in the opponent's favour; do not reopen these choices implicitly.
- [ ] Tune crouch's movement/vision tradeoff; quieter movement and cover protection remain future mechanics. Check reasons to stand and vulnerability while repositioning.
- [ ] Play contested pickups with swapped spawns, compare walking routes through stairs and single-stair camping versus two routes. Strongest-weapon central weighting is an experiment, not the current placement rule.

- [ ] Complete the M1 demo/playtest checkpoint and record feedback before expanding menus; the user has already tried the existing duel, crouch and click.

## Later tasks

Follow-up tuning is driven by the M1 verdict; engine implements rule changes and AI owns shot synthesis.

## Verification/latest delivery

2026-11-17 play (combat feedback slice 1, empty click): root `pnpm checks` exit 0 (engine 842, webapp 270), full acceptance 166 of 166 on a production build at a busy load average, spec `ClickingOnAnEmptyWeapon` 6 criteria red first (4 of 6) then green, 6 engine and 5 browser mutants (wake-up removal survived, see above), folder/caller audit done, committed by the user as `8acad87`. Afterwards `SoundPlaywright.startWatching` was split into four private methods; spec still 6 of 6 (one run timed out at load average 110).

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
