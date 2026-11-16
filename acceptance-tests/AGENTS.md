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

The duel's opponent draws every choice from a seed, and `startDuel()` opens the page with a fixed one (`DUEL_SEED`), so a spec
replays the same duel and only Playwright's timing varies. That timing decides how many game ticks pass between two looks, so
a duel spec asserts **properties** (it engages, it leaves its spot, its magazine runs down, a standing player loses in the
end), never exact positions or tick counts. A wait that can take longer than the 5 s expect timeout takes an explicit
`timeoutSeconds` grounded in a measurement (`FightingBack`: 15 s against 9.4 s measured over 40 seeds), not a guess. The one
duel long enough for the opponent to run dry has its own seed (`LONG_DUEL_SEED`, `startLongDuel()`); only 2 of 40 seeds get
that far. A round that has just begun is live, so a spec never asserts that the opponent is "full" in it (a quick bot has fired by the time it reads): it measures what was restored against the frozen end of the round before. Sparring has no brain, so its opponent never moves; the specs aim at where it stands. The duel is a best-of-three
(`PlayingABestOfThree`): it loses rounds by standing still, and round _n_ of a match plays seed `DUEL_SEED + n - 1`. No spec
wins a round **by shooting**, and that was measured: over 60 seeds, with the player idle for a start delay, then aiming at where the opponent
stands and holding fire, a round is won only when the aim is taken at exactly 0.50 s of game time (60 of 60 seeds; 0 of 60 at 0.45 s
or 0.55 s, with up to 0.1 s of lag from aiming to firing), so it is a timing window narrower than a spec can hit, not a property of a
seed. Winning a match is covered by engine and webapp unit tests (`Step`, `ScoreRound`, `DecideMatch`, `RoundMessage`). **A round is won in a
browser by the closing ring** (`TheClosingRing`, below), whose seeded centre leaves the opponent outside it.

## Vision

`gunsmith.vision` (`getView()`, `isOpponentSeen()`) reads the state hook's `vision` and `opponent.visible`: the game's own account of what the
player sees. `SeeingOnlyWhatYouFace` uses sparring, whose opponent never moves, and walks or aims the player instead (in front, behind, 70 degrees
to the side, beyond the rifle's range, behind a pillar, then the marksman rifle's longer reach). A spec that fires or reads dummies must compare
what it means (`x`, `y`, `health`), not whole snapshots, since turning changes `visible`.

## Heights

`ClimbingAStair` opens `?scenario=heights` (`gunsmith.startHeights()`), whose player starts at (8.5, 3.5) on the low ground with a platform one level up from
x = 10 and a single stair at (9, 3). It reads `gunsmith.player.getLevel()` (the state hook's `player.level`: 0 low ground, 1 platform, half way on a
stair) and asserts the edge stops the player as a wall does (x between 9.4 and 9.7, level 0), the stair climbs (x past 11, level 1) and comes down again.
`SeeingAcrossLevels` (in `vision/`) opens the same arena, which has a dummy four tiles east on the platform (12.5, 3.5) and one four tiles west on the low ground (4.5, 3.5),
both on the player's row and inside the rifle's reach. It reads `gunsmith.dummies.isSeenAt(place)` (the snapshot's `dummy.visible`): the platform dummy is not seen from the low
ground, though in front and in reach (the spec checks the reach first, so only the height can hide it), and is seen after the climb; the low-ground dummy is seen from the low ground and
from the platform. Written after the engine code, so proved by mutation: sight ignoring levels fails exactly the first criterion.

## The ring

`CountingDownToTheRing` (in `ring/`) reads `gunsmith.ring` (the state hook's `ring.secondsUntilStart` and the HUD's `ring-countdown`): the duel counts down from 45 game seconds, falls as the round is played, stops when the round is lost (the game's clock runs on, the ring's does not) and starts again in the next round; sparring and the practice range have no ring and no countdown.

`TheClosingRing` opens **sparring with ring timing in the query** (`gunsmith.startClosingRing({seed, delaySeconds, closingSeconds})` opens `?scenario=sparring&seed=..&ringDelay=..&ringClosing=..`), so 45 real seconds is never waited for. Sparring's opponent stands still and cannot shoot but **does take ring damage**, so the ring alone decides the round, and **where the seeded centre falls decides who is left outside**: so each outcome has a pinned seed, measured in the engine like `LONG_DUEL_SEED` (seed 26: the opponent is outside, the round is **won**, the player untouched; seed 14: the player is outside, **lost**, the opponent untouched). The delay is three seconds so reading the page cannot be late for "the whole arena is inside the ring". A spec never steers the player to the centre (full-speed overshoot is the heights flake). The ring edge's drawing is a shader on the canvas: `DrawingTheClosingRing` reads it from a screenshot (`gunsmith.ring.isEdgeDrawn()`, `isInsideUntinted()`, `isOutsideTinted()`, decoded in the page, since the canvas is not in the DOM) at the places the hook's `ring.centre`, `radius` and `damagePerSecond` say it is, and `gunsmith.ring.getShaderErrors()` is the console's shader errors, listened for from the moment the page is created (a shader compiles on first draw). The ring closes slowly there (30 s), so the half second between reading the ring and the screenshot moves its edge less than the line's width; the pixel mapping assumes the camera fits the arena to the window and centres it. **The freeze criteria need a slow ring** (`SLOW_CLOSING_SECONDS`, 30): at the quick one the ring has finished closing before anyone dies, so "it stopped closing with the round" would pass for a ring that never stopped (a mutant that kept the ring's clock running survived until it got its own slower `given`, plus a criterion that the ring was still closing when the round ended). The HUD's health is whole points rounded up, so `hud.waitForHealthToMatchTheGame()` compares with the hook's health rounded up (the game's own account is fractional once the ring hurts).

`TheOpponentStayingInTheRing` opens the **duel with ring timing** (`gunsmith.startClosingDuel({seed, delaySeconds, closingSeconds, damageScale?})`: `?scenario=duel&seed=..&ringDelay=1&ringClosing=6&ringDamage=10`), the player idle, so the only thing that can hurt the opponent is the ring. **The ring closes at its usual pace but hurts ten times as much** (`damageScale`, `?ringDamage=`), so a bot that ignores it is badly hurt within seconds and each round is over in about 3.5 s, not 8: the file takes about 5 s instead of 10 (it was 7.7 s a round before). Seeds 12 and 19 were measured in the engine over 0 to 39 as ones where a bot that ignored the ring ends with 10 and 0 health (14 of 40 seeds were hurt; with the bot walking in, 1 of 40: seed 10, which loses health as the ring outruns it round a pillar, so it is not used). Criteria per seed: the ring hurts more than 20 a second, the most an unboosted ring ever does (the one criterion the boost alone satisfies: without it a dropped `?ringDamage=` would go unnoticed, since "the bot is unhurt" holds at any strength); the opponent's health is exactly 100; and it stands inside the ring. Written after the engine code; proved by browser mutants (shelter disabled, no margin, ring not given to the bot, damage scale ignored, dropped from the query or from the DSL: each fails 2 to 5 of the 6). `startClosingRing` takes the same `damageScale`.

## Pickups

`PickingUpAWeapon` opens **sparring with a seed** (`gunsmith.startSparringWithSeed(seed)`), whose opponent never moves, so only the player can take the weapon. Seeds were measured in the engine over 0 to 39: **seed 8** puts it on the fighters' own row at (13.5, 6.5), so `player.walkFor("east", 0.7)` walks over it; **seed 6** puts it at (13.5, 2.5), four rows away, so the same walk passes it by. It reads `gunsmith.pickup.get()` (the hook's `pickup`, `undefined` once taken) and `weapon.get()`; "faces it" and "faces away" wait with `expect.poll` on `visible`. `APickupEachRound` loses the duel's first round (seeds 2 then 3 put it on different rows) and checks the next round has a new one. No spec has the bot take it: against an idle player it never gets within reach on the pinned seeds.

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
