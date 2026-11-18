# AGENTS.md: acceptance-tests

Playwright runs the specs, desktop only (gunsmith is a desktop game). Kept small: nothing is here until a spec needs it. Three layers, imports only point downwards, and every arrow is a lint
rule in `eslint.config.js`, so a violation fails `pnpm checks`:

```
src/tests/                        the mapping and @gunsmith/shared, nothing else
src/acceptance-criteria-mapping/  src/dsl/; never src/tests/
src/dsl/                          itself; never upwards
```

A `src/shared/` layer (helpers more than one layer needs) arrives when something needs it.

## What a spec may reach

The DSL, through the mapping's `given` / `when` / `then` / `beforeEach` / `expect`, and nothing else: no `page`,
`context` or `browser`. `withDslOnly` rebuilds the argument at runtime, and lint bans Playwright and `@src/dsl/**` under
`src/tests/`. **Do not work around it.** To give a spec a new capability, add the locator work to a `*Playwright`, then
the one-line wrapper on the `*Dsl` beside it.

- **`<Thing>Dsl.ts`** is what a spec may say. It holds no locators, takes a `Page` only to build its own `*Playwright`
  in the constructor (never keeps it), and wraps each call in `try`/`catch` that rethrows a `DslError` naming the
  intention. **Every method, sync ones too**, is one `try`/`catch` and nothing else; lint enforces it (`src/dsl/**/*Dsl.ts` in `eslint.config.js`).
- **`playwright/<Thing>Playwright.ts`** holds the locators, clicks and waits. It catches nothing. It extends `BasePage`
  and reads the game with `this.readGameState()` and waits on it with `this.waitForGameState(check)` (polled from the
  test, so the check may use anything in scope). Only something that must run inside the page, such as the bullet recorder,
  uses `page.evaluate` or `waitForFunction`. A spec must never rest on a wait alone: assert the state after it.
- A thing's parts go in its `components/` folder, mirroring the app's own tree: `GunsmithDsl` owns `arena`, and so on.
- **An action is a verb** (`resizeWindowTo`), a query is not (`getSize`). The verbs are listed in the `then` lint rule
  in `eslint.config.js`, so a `then` cannot arrange anything. Add a new action there too.

## The canvas is not in the DOM

react-three-fiber draws to a `<canvas>`, so a spec cannot find a player or a wall by role. The DSL reads game state
through deliberate, read-only hooks the webapp ships (`data-ready` on the arena today). Keep each one tiny. A spec that
reads the canvas before `data-ready` is `true` sees the browser's default 300 by 150, which is how that hook was found.
What is drawn over the canvas is ordinary DOM (the ammunition display): read it by test id, as `gunsmith.hud` does, and
check it against the state hook, which is the game's own account of the same thing.

## Duels are seeded, and specs assert properties

- Use the DSL's seeded scenarios so engine choices replay. Browser timing still varies: assert behavior, never exact tick counts or live positions.
- Ground longer timeouts in measurements. A just-started fighter may already have fired; compare restored state against the frozen previous round instead of assuming a pristine live frame.
- Sparring supplies a stationary opponent. Use deterministic ring scenarios for round outcomes; timing a duel win by shooting has proved fragile. Preserve failures as seeded fixtures.

## Vision

Read visibility from the hook. Compare the fields a criterion means, not whole snapshots that may change when aim turns. Check cone direction/range and wall/height occlusion separately.

## Heights

Use the heights scenario for stair and level criteria. **Stop a walk by the game's clock, not by polling**: `player.walkUntilPast({heading, limit, watch})` in a held game (`holdTheGame`) stops within one step of the limit; a walk stopped by a test that looks every so often ran on while the machine was busy and left the player a tile or two past the dummy on the platform, which then took a shot meant for the one behind them (the `ShootingAcrossLevels` flake, fixed 2026-11-18, together with a shot that lives 75 ms and is now looked for at every held frame, not waited for; `SeeingAcrossLevels` and the climbs in `ClimbingAStair` still poll). Cover blocked drops, legal stairs, low-to-high occlusion and high-to-low sight/shots. Rendering needs screenshot checks where geometry tests alone cannot establish what is drawn.

## The ring

Use query-configured ring timing rather than waiting the default countdown. A freeze assertion needs a ring still closing when the round ends; an already-closed ring gives false coverage. Read shader errors and compare screenshot samples with the hook's ring geometry.

## Drawings (art's pictures)

`DrawingTheOpponent` does the same for the opponent (sparring's stands still): grey body, two small orange stripes, the outline, no placeholder; turned away (`vision.isOpponentSeen()` false) **nothing at all** is drawn at its place, which is the fog rule seen on the screen; turned back it is drawn again. The look helpers are shared in `playwright/look/` (`lookOfFighter(page, centre, teamColour)`, `TeamColours`).
`DrawingThePlayer` also checks the drawing **turns with the aim** (`isHandOnTheFacingSide()`, aiming in four directions): the body is round, so its colour counts and outline are the same turned any way, and only the hand, a third of a tile ahead of the centre, shows which way it faces.

`DrawingThePlayer` reads what a player sees from a screenshot, like `DrawingTheClosingRing` (the canvas is not in the DOM): `playwright/screen/ColoursAtTiles.ts` returns the colours at a list of places in tiles (the ring's line sampling and the player's grid both use it); in `playwright/look/`, `ColourIsNear` matches a flat fill within a tolerance and `ColourIsPaleGrey` matches the
placeholder's tone-mapped barrel (unit-tested, `pnpm test` here). `gunsmith.player.getLookOnScreen()` samples a 1.5-tile square on the player (gap 0.025 tile) and counts the body's grey (`#30404F`), the team's blue (`#62B5FF`) and pale grey, and checks the body's outline (`#91A2B2`) at the circle walls stop (0.4 tile, eight compass points, three radii each, since a 2-pixel line blurs at its edge):
the player must stand still. **A check must look for what only the drawing has**: the placeholder disc was close to the team's blue, so blue alone would have passed; the grey body, a small stripe, an outline at exactly the hitbox's radius and no pale grey say the drawing is there and placed. Counts are the same every run (413 grey and 24 stripe standing, 146 and 16 crouched), thresholds sit well off them.
**`data-sprites-ready`** is waited for whenever the DSL opens the game (`GunsmithPlaywright.waitForArena`), so a spec never reads the placeholder. `startSparringWithHeldPictures()` holds art's `.svg` files back with a route until `releasePictures()` (so a spec can assert `arena.isWaitingForPictures()` while they are missing, deterministically: a time delay was measured and failed to kill a mutant that set the signal early, since it is a race a fast machine wins), and `startSparringWithMissingPictures()` answers 404 to them, to show the placeholder shows and the page still becomes ready. **The route's glob must end in `.svg`**: the dev server also serves the app's own `src/assets/sprites/*.ts`, and `**/assets/sprites/**` 404'd those and left a blank page.

`DrawingTheShots` looks at a shot, which is in the air for 0.17 to 0.5 s, so it **holds the game still**: `gunsmith.holdTheGame()` installs Playwright's fake clock (`page.clock`) and pauses it 3 s of real time later (shorter raced under load, which refuses to pause "in the past"), and `runGameFor(seconds)` lets the game run a given game time and holds it again. Nothing real-time moves meanwhile, so a screenshot shows one moment. While held, anything that waits on the game never ends: run it first. `bullets.getAll()` gives each shot's `shooter` and `directionDegrees` (shared `BulletSnapshot`); `bullets.getLookOnScreen(shot)` (`playwright/look/look-of-shot/LookOfShot.ts`, places from `ShotPlacesOf`) counts places inside the bar, beside it, ahead of the tip, past the tail and at the bullet by colour, so a drawn bar in the right team colour, lying along its flight, with its tip on the bullet, is told from the placeholder disc (which has no length). `bullets.runUntilTheOpponentFires(seconds)` runs the held game in 0.02 s steps until an opponent shot has flown 1 tile from its body (a fresh one is under the body, which is drawn over it).

## Fair starts

`StartingOnFairGround` opens `?scenario=fair-duel` (`gunsmith.startFairDuel(seed)`; seeds 2, 17, 28). The idle player's place is exact; the opponent has a brain and walks before the first read, so a criterion about its place allows at most 6 tiles a second times `gunsmith.round.getElapsedSeconds()` (a flat tolerance flaked 4 in 80).

## Being shot from out of sight

`TheOpponentShotFromOutOfSight` (in `duel/`) opens `?scenario=overwatch` (`gunsmith.startOverwatch(seed)`; seeds 2, 5, 7): a corridor one tile wide, the opponent wandering on the low ground ten tiles from the player, who stands on the platform at the end, farther than it sees. The player fires west along the row (`aimAtTile`, `startFiring`) until `opponent.waitForHealthBelow(100)`, and the criterion is that `behaviour` is no longer `wander`. It fails with the opponent's reaction to a shot switched off (`rememberShot` made a no-op: all three seeds time out). It cannot also assert that the opponent comes up the stair: the trigger is still down while the browser notices the first hit, so four rounds land and the bot dies; the engine's step tests cover the climb. The seeds are those where the old opponent never left `wander` in fifteen seconds (19 of 40).

## Pickups

Use seeded sparring to isolate player pickup behavior. Assert visibility and inventory consequences as well as pickup disappearance. Keep duel round-reset coverage separate from a bot taking a weapon. `TheOpponentFetchingTheWeapon` opens `?scenario=pickup-race` (`gunsmith.startPickupRace(seed)`; seeds 2, 17, 28): the weapon lies nearer the opponent, who leaves the idle player in its sight to take it; `gunsmith.pickup.waitUntilTaken(seconds)` waits, and the opponent's magazine (over the rifle's twelve) says it holds it. It fails with the bot's seeking switched off (the weapon is never taken).

`DrawingAGeneratedWeapon` (`tests/pickup/`) opens `gunsmith.startSparringWithPickupDrawing({seed, drawing: "lantern" | "refused"})` (seed 8) and reads `gunsmith.pickup.getLookOnScreen()` (`components/pickup/playwright/look-of-pickup/`) over the place the hook says the weapon lies. Count only colours the drawing alone has (weapon blue, the core's pale `#E5EAF0`; the body grey is the wall's and the outline the background's). The old disc reads as `(168, 216, 202)`, **not** its source `#7ee0c3`, because its material is tone-mapped (matching the source colour let "the disc is gone" pass with the disc on screen). Even a drawing accidentally left under the fog must be detected. The fog criterion uses the marker sampler's `markedPixels` over the whole pickup footprint. Measured: lantern 38 blue and 24 pale, stand-in 6 blue and 0 pale; thresholds sit well off them.

`DrawingThePickupMarker` checks the four C2 corners and cardinal gaps and samples the full 88-unit marker canvas for fog and collection. Its marker query accepts a saved pickup position and a nearby clear tile under the same light. It compares matching tile-local pixels from the same screenshot, so the floor seams and ticks do not count as pickup marks. The lantern core sampler stays inside the outline because both use the same pale colour.

`DrawingTheTerrain` uses `?scenario=terrain` to check the three floor levels, wall braces, joins, stairs, drop edges and fog at 64 and 32 pixels per tile. It also holds or returns 404 for the highest floor SVG to test readiness and the flat fallback.

## Hit confirmation

`HittingATargetOnTheScreen` / `HittingATarget` hold the game and fire, turn away before the bullet lands (a hidden hit), and read the four mint corners from a screenshot (`player|opponent|dummies.getHitOnScreen`, `runUntilHurt` runs the held game until that target loses health, seen or not; `playwright/hold/RunHeldUntil`). Hidden-hit criteria need the unit guard _and_ the draw-time sight gate both broken to fail: mutate both.

## Camera shake and reduced motion

`ShakingTheCameraOnAHit` and `ReducingMotion` hold the game on a hit and read where the camera put the picture from `gunsmith.camera.getShake()` (the canvas's `data-camera-shake`, worked out from the camera's real position, so a shake computed but never applied fails). A shake lasts 100 ms: watch in 0.02 s steps and sample 0.03 s later, or it is over (a ring watched in 0.25 s steps let a mutant that made the ring shake survive). Before a spec that photographs the moment of a bullet hit, call `gunsmith.keepTheCameraStill()` (`?shake=0`); do not use reduced motion for that, it removes the brackets' opening and the trail those specs assert. `askForReducedMotion()` is `?reducedMotion=1`, `preferReducedMotion()` is the browser's `prefers-reduced-motion`; both go before `startDuel`. `getDamageOnScreen().leftBracketReachPixels` says whether the brackets opened.

## Sound

Sound is not part of the state hook. The DSL traces fetch/decode to a manifest key and records source starts, loop flags and ended events. A recorded buffer start does not prove device playback, first-interaction context wake-up, masking or listening quality. The 100 ms burst merge cannot be arranged reliably in a browser, so it is unit-tested in `webapp/src/sound/damage-crunch/`.

## Online rooms

`gunsmith.room` (`components/room/`) is for two browsers in one private room. **A fog criterion reads what the browser was sent, never the state hook or the drawing**: `room.hasBeenToldWhereTheOtherPlayerIs()` looks at the latest `snapshot` frame the page's WebSocket received (`playwright/wire/SnapshotsOfFrames`), and each absence is paired with `room.hasReceivedSnapshots()` so a dead socket cannot pass. The second browser is `gunsmith.room.secondBrowser()`, opened lazily in a context of its own and closed by `gunsmith.end()` in the fixture teardown, so no other spec pays for it. Managed production preview (`pnpm acceptance-tests:preview:local`) starts the Worker and Vite together. To use an existing local or deployed API with the local build, run `API_URL=<HTTP(S) origin> pnpm acceptance-tests:preview:api`; only Vite is managed. See Operations.md for ports and mode selection. For manual servers, start the Worker (`API_PORT=<port> pnpm api:dev`) and serve the build with `API_URL=http://localhost:<port>` so the preview's `/api` proxy reaches it (`api/AGENTS.md`); without it the spec fails at `createPrivateRoom`. Specs that need a bad connection ask for one before opening the room: `room.slowTheConnectionBy({milliseconds, jitterMilliseconds})` and `room.receiveOnlyEveryNthSnapshot(n)` use Playwright's WebSocket route (a fixed, uneven pattern, never random, so a failing run replays). **On a routed socket Playwright reports a frame when the server sends it, before the hold-up**, so the room records frames where the route hands them to the page; a spec that reads frames needs nothing more. Smoothness is asserted as a state or a measured step: `room.isShownAheadOfTheServer()` (the page shows the player past the newest frame it was given), and `getLargestShownJump()` / `getLargestShownOpponentJump()` (the largest step between two drawn frames beyond what walking at the server's own pace explains over the measured time between them, so a frame dropped under load is not a jump; the pace is read from the snapshots, never written in a spec). `TwoBrowsersPlayingARound` and `TwoBrowsersPlayingABestOfThree` play real rounds: the first browser aims at the second, who stands still, and holds fire until `round.waitForState("won", 30)` (about 6 to 10 s a round); each browser's banner and `match` score are read from its own side, a click on "Next round" by one player only shows `round.isWaitingForTheOtherPlayer()`, and the round begins when both have clicked. The best of three runs about 15 s of the 30 each criterion is allowed; if it gets slower under load, give the mapping a way to call `test.slow()` rather than raising the global timeout. `TwoBrowsersReconnecting` (reconnect): `room.prepareToLoseTheConnection()` (before `createPrivateRoom`, a routed socket like `slowTheConnectionBy`) lets `room.cutTheConnection()` drop the page's socket as a network would, and `keepTheConnectionDown()` / `letTheConnectionBack()` turn every retry away until released; `leaveTheRoom()` / `returnToTheRoom()` close and reopen the tab, and `joinAsAStranger(code)` opens a third browser and waits for its socket to be refused. **Wait with `room.waitForTheMatchAgain()`**, never `waitForTheMatch()`: frames carry across a reconnect, so it waits for a `joined` after the cut and a snapshot after that. The input-after-return criterion is the one that caught a race (an input sent before `joined`); a place that is merely kept proves nothing about it, so it walks, stops, and checks the page agrees with the server. The frozen criterion leaves while walking and returns after 1.5 s (6 tiles a second): an unfrozen fighter is several tiles on. `NoJumpsWhenTheServerCorrectsThePlayer` holds a jump under a tile (where a correction stops being eased); how gently the ease runs is in the unit and property tests. `TwoBrowsersGoingQuiet` (forfeits): `room.createPrivateRoom({reconnectSeconds, idleSeconds})` makes a room that waits seconds, not the real 30 and 60 (the limits ride on that first page's address as `?reconnectSeconds=&idleSeconds=` and the server takes them from the room's first connection alone, so the DSL keeps no state for them: only `createPrivateRoom` is told). **The player who is not being timed must keep asking for something new** (`room.keepMovingFor(seconds)`), or they go quiet too: a seat silent through a long page load or wait is the one that forfeits, and two running out together forfeit nothing. A player left idle forfeits the next round too, one idle time later, so the criteria watch at a time between the two (4 s limit, 6 s watching). Reloading a page inside a timed room races the other player's clock under load: that path is covered in `MatchRoom.test.ts`, not here. With eight workers the whole online folder is load-bound (existing smoothness and reconnect specs fail too); run it with `--workers=3`.

## Running

```bash
pnpm install-browsers                                    # once: downloads Chromium
pnpm start                                               # terminal 1: the dev server on port 3000
pnpm acceptance-tests                                    # terminal 2
WEBAPP_URL=http://localhost:3100 pnpm acceptance-tests   # against another port
pnpm --filter @gunsmith/acceptance-tests acceptance-tests:headed
```

Port 3000 may be occupied by another local server: start ours with
`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` and point `WEBAPP_URL` at it, or the specs could drive the wrong application. Kill the server you started by process (`pkill -f "vite.*--port 3100"`). `pnpm test` here is Vitest, for
DSL helpers only; it excludes `src/tests/`. Failure screenshots and video land in `test-results/`.

`TheOpponentClimbingToTheRing` uses the seeded terraced scenario to assert actual climbing and ring escape. `TheOpponentComingDownFromThePlatform` (in `duel/`) opens `?scenario=overlook` (`gunsmith.startOverlookDuel(seed)`; seeds 2, 17, 28): the opponent starts on the platform and the player idles on the low ground 11 tiles away, past its far range. The round is lost either way, so the criterion is the level: `gunsmith.opponent.get().level` is 0 once it has come down, and `gunsmith.player.getLevel()` is unchanged. It fails with the engage route switched off. Preserve this alongside sprite drawing/readiness criteria.
