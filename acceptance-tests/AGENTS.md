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

## Pickups

Use seeded sparring to isolate player pickup behavior. Assert visibility and inventory consequences as well as pickup disappearance. Keep duel round-reset coverage separate from a bot taking a weapon.

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
