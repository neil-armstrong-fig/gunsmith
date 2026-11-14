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
_wins_ a round, and that was measured: over 60 seeds, with the player idle for a start delay, then aiming at where the opponent
stands and holding fire, a round is won only when the aim is taken at exactly 0.50 s of game time (60 of 60 seeds; 0 of 60 at 0.45 s
or 0.55 s, with up to 0.1 s of lag from aiming to firing), so it is a timing window narrower than a spec can hit, not a property of a
seed. A spec-only way to win would be a seam, so winning is covered by engine and webapp unit tests (`Step`, `ScoreRound`,
`DecideMatch`, `RoundMessage`).

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
