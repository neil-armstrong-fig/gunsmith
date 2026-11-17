# AGENTS.md: acceptance-tests

Playwright runs the specs, desktop only (gunsmith is a desktop game). Modelled on janggi's `acceptance-tests/` and kept
smaller: nothing is here until a spec needs it. Three layers, imports only point downwards, and every arrow is a lint
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
  intention.
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

Use the heights scenario for stair and level criteria. Cover blocked drops, legal stairs, low-to-high occlusion and high-to-low sight/shots. Rendering needs screenshot checks where geometry tests alone cannot establish what is drawn.

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

## Pickups

Use seeded sparring to isolate player pickup behavior. Assert visibility and inventory consequences as well as pickup disappearance. Keep duel round-reset coverage separate from a bot taking a weapon. `TheOpponentFetchingTheWeapon` opens `?scenario=pickup-race` (`gunsmith.startPickupRace(seed)`; seeds 2, 17, 28): the weapon lies nearer the opponent, who leaves the idle player in its sight to take it; `gunsmith.pickup.waitUntilTaken(seconds)` waits, and the opponent's magazine (over the rifle's twelve) says it holds it. It fails with the bot's seeking switched off (the weapon is never taken).

## Sound

Sound is not part of the state hook. The DSL instruments fetch/decode/play calls by manifest key. A recorded buffer start does not prove device playback, first-interaction context wake-up, masking or listening quality.

[Historical scenario notes](../docs/history/2026-11-17-compaction/AcceptanceInstructions.md)
retain seed choices, timing measurements and mutation evidence. Current fixtures and tests are authoritative.

## Running

```bash
pnpm install-browsers                                    # once: downloads Chromium
pnpm start                                               # terminal 1: the dev server on port 3000
pnpm acceptance-tests                                    # terminal 2
WEBAPP_URL=http://localhost:3100 pnpm acceptance-tests   # against another port
pnpm --filter @gunsmith/acceptance-tests acceptance-tests:headed
```

Port 3000 may be taken by janggi's dev server (`AGENTS.md` gotchas): start ours with
`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` and point `WEBAPP_URL` at it, or the specs drive
janggi. Kill the server you started by process (`pkill -f "vite.*--port 3100"`). `pnpm test` here is Vitest, for
DSL helpers only; it excludes `src/tests/`. Failure screenshots and video land in `test-results/`.

`TheOpponentClimbingToTheRing` uses the seeded terraced scenario to assert actual climbing and ring escape. `TheOpponentComingDownFromThePlatform` (in `duel/`) opens `?scenario=overlook` (`gunsmith.startOverlookDuel(seed)`; seeds 2, 17, 28): the opponent starts on the platform and the player idles on the low ground 11 tiles away, past its far range. The round is lost either way, so the criterion is the level: `gunsmith.opponent.get().level` is 0 once it has come down, and `gunsmith.player.getLevel()` is unchanged. It fails with the engage route switched off. Preserve this alongside sprite drawing/readiness criteria.
