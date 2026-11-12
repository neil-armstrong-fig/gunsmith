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
- **`playwright/<Thing>Playwright.ts`** holds the locators, clicks and waits. It catches nothing.
- A thing's parts go in its `components/` folder, mirroring the app's own tree: `GunsmithDsl` owns `arena`, and so on.
- **An action is a verb** (`resizeWindowTo`), a query is not (`getSize`). The verbs are listed in the `then` lint rule
  in `eslint.config.js`, so a `then` cannot arrange anything. Add a new action there too.

## The canvas is not in the DOM

react-three-fiber draws to a `<canvas>`, so a spec cannot find a player or a wall by role. The DSL reads game state
through deliberate, read-only hooks the webapp ships (`data-ready` on the arena today). Keep each one tiny. A spec that
reads the canvas before `data-ready` is `true` sees the browser's default 300 by 150, which is how that hook was found.

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
