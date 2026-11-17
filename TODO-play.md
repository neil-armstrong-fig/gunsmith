# TODO: play

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: **worktree `.claude/worktrees/play`, branch `worktree-play`**, created 2026-11-17 from main `6f6b028` (last merged main: `6f6b028`). Its own `node_modules`; serve on port 3300 (`pnpm --filter @gunsmith/webapp exec vite --port 3300 --strictPort`, or `vite preview --port 3300` after `pnpm compile`) and run specs with `WEBAPP_URL=http://localhost:3300`. Start every turn with `git log --oneline HEAD..main` and merge if main moved. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Combat feedback and inventory integration. Start with incoming-damage feedback after agreeing engine events.

**State after slice 2a (2026-11-17, play, integrated into main):** the engine's `damageTaken {cause: "bullet" | "ring", amount}` exists (`engine/src/combat-events/`: `EventsRequest.damage` = `{health, bullet, ring}`, `damage-taken/DamageTakenEvents` caps by health, bullet first, the ring gets what is left; `Step.ts` keeps the two causes apart before it sums them) and the crunch plays: `sfx-damage-crunch` (MP3 encoded from art's WAV with the audio workspace's recipe, in `SoundKeys`/`SoundUrls`), `sound/damage-crunch/DamageCrunch` (one crunch per burst, `BURST_SECONDS` = 100 ms of game time from the first hit, not stretched; the fatal hit still crunches; the ring does not crunch; reset when the round is not being fought), `TickCues.seconds` passed by the loop, spec `TakingDamage` (4 criteria). **Slice 2b is not started; the user chose the `store/feedback/` channel below (the HUD cannot see events otherwise):** the game store keeps only the frame's last `World` and is pinned to `{world, setWorld}`, so a hit in an earlier tick of a multi-tick frame never reaches `HealthHud`, and the handover makes the brackets bullet-only (health falling cannot drive them: the ring also lowers it). **Proposal:** a third tiny store `store/feedback/` (a lint allow-list and a keys test like the game store's), written by the loop after each tick with `{bulletHits: number, ringHurting: boolean}`, read by `health-hud/` through a selector; the brackets re-trigger a 180 ms CSS animation keyed on `bulletHits`, the unsafe treatment follows `ringHurting`, and the 350 ms trail needs no store (a second, lagging bar behind the health bar with a CSS width transition). Round change zeroes it. The trail must snap, not animate, when health rises at a round reset. **Ring sound:** the user wants a continuous effect, not the crunch; the ring is silent until art delivers `sfx-ring-damage-loop` (request in `TODO-art.md`). Then play adds `startLoop`/`stopLoop` to `WebAudioOutput` and `SoundOutput`, started on the first `damageTaken` ring step and stopped on the first step without one or when the round ends (about 100 ms gain fades; muting and `cancel()` stop it), spec first (a loop plays once per exposure and stops). The crunch's loudness is not tuned with the click.

**State after the first 2026-11-17 session (play, formerly build 1):** combat feedback slice 1, the empty-weapon click, is **delivered and committed** (`8acad87`; art's MP3 swap `2970f33` since). The user played it: audible but "a bit abrasive and loud"; tune later, once more sounds are in (gain or a swapped file, with art). What exists, so do not rebuild it: `engine/src/combat-events/` (`EventsOfStep({playerTurn})`, `World.events` for one step only, set on every `step` return, fireRefused for the player only); webapp `src/sound/` (`CombatSounds.afterTick({events, firing, round})` called after **every tick** in `use-game-loop/UseGameLoop.ts`, `empty-click/ClickLatch`, `web-audio/WebAudioOutput`: a sound is dropped, not queued, while the context is suspended), `src/assets/sounds/` (keys, URLs, files), `store/app/` (`muted`; **M** mutes, `?mute=1`), `use-game-loop/hooks/use-combat-sounds/`, a lint boundary for `sound/`, and the acceptance recorder `gunsmith.sound.getPlays(key)` (`SoundPlaywright`: wraps `fetch`, `decodeAudioData`, `AudioBufferSourceNode.start`; added by `GunsmithDsl.begin()`). Read `webapp/AGENTS.md` ("Sounds") and `acceptance-tests/AGENTS.md` ("Sound") before changing it. ****Slice 2 then went ahead: see 2a above.** Slice 4 will need `ArenaPointAtPixel` and the acceptance `ScreenPositionOfTile` to take the shake offset, and reduced motion (`prefers-reduced-motion`, `?reducedMotion=1`, in `store/app`). **Known gaps, plainly:** the audio context's wake-up on a first press is not proven by any spec (the test Chromium starts audio running whatever flag it is given); no spec covers a hold with no reserve (the engine test does); the build-2 loop priority (`useFrame(cb, -1)`, so drawing sees the current world) lives in a source worktree and must survive the merge of `UseGameLoop.ts`. **Open question for the user:** M has its own `keydown` listener (like `useWeaponKeys`); `useHeldKeys` was judged the wrong fit (a held state; a tap between frames would be lost). If they want less duplication, extract `usePressedKey(code, onPress)` for M and for R/1/2 (touches `useWeaponKeys`, so ask first). Other sessions may be live: check `ListAgents` and `git status` before touching `UseGameLoop.ts`, `HealthHud.tsx` or `Step.ts`. **Resume prompt:** "You are play, continue the TODO: combat feedback slice 2b. Read the instruction files, build the `store/feedback/` store the user chose, and write the acceptance spec first, watched red. Leave changes uncommitted."

Current milestone: M1; the project remains on M1. Next failing test/check: slice 2b, with the `store/feedback/` channel the user chose: a spec for the coral brackets on a bullet hit (not on ring damage), the sustained unsafe treatment while the ring hurts, and the 350 ms health trail; write it first and watch it fail.

## Ownership

Webapp combat HUD, camera feedback, input/screenshot offsets, local sound playback and M1 playtests. Engine produces simulation events; art owns assets/manifests.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Wait for engine event/data changes before consuming them. Independently specify the damage feedback acceptance cases using [the handover](docs/art/concepts/combat-feedback/Handover.md). Coordinate inventory with art.

## Current milestone tasks

- [x] Art's shots are drawn (blue player, orange opponent; `components/bullets/shots/`), with `DrawingTheShots` and the game-loop priority −1 fix; delivered 2026-11-17, implementation details in `webapp/AGENTS.md`. Still shelved by the user until feature complete: the held-weapon picture (slice 3) and the muzzle flash.
- [x] Combat feedback slice 2a: local `damageTaken` (bullet/ring), selected crunch with 100 ms burst merging and one voice (2026-11-17, uncommitted in worktree `play`). The ring crunch was dropped at the user's request.
- [ ] Ring damage loop: blocked on art's `sfx-ring-damage-loop`; then loop playback in `sound/` as described above.
- [ ] Slice 2b: coral brackets and the 350 ms health trail in `health-hud/`, cleared on round change; uses the `store/feedback/` channel (see the state above).
- [ ] Slice 3: `hitLanded` only for visible targets, `sfx-hit` and mint ticks. Slice 4: camera shake/cosmetic recoil, shared pointer/screenshot offsets and reduced motion. Follow [the handover](docs/art/concepts/combat-feedback/Handover.md).
- [ ] Adopt the approved [inventory display](docs/art/concepts/inventory-display/README.md): two icons, selected name, fixed footprint and pointer pass-through. Agree minimum local inventory/name/icon data before changing the hook or manifest.
- [ ] Add art's pickup glow when a key is agreed. Custom/dropped weapons and variety remain engine work; shot synthesis belongs to AI. Existing pickups equip slot 2, discard its previous weapon and break a simultaneous claim in the opponent's favour; do not reopen these choices implicitly.
- [ ] Tune crouch's movement/vision tradeoff; quieter movement and cover protection remain future mechanics. Check reasons to stand and vulnerability while repositioning.
- [ ] Play contested pickups with swapped spawns, compare walking routes through stairs and single-stair camping versus two routes. Strongest-weapon central weighting is an experiment, not the current placement rule.

- [ ] Complete the M1 demo/playtest checkpoint and record feedback before expanding menus; the user has already tried the existing duel, crouch and click.

## Later tasks

Follow-up tuning is driven by the M1 verdict; engine implements rule changes and AI owns shot synthesis.

## Verification/latest delivery

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.
