# AGENTS.md: webapp

The React app: Vite, React 19, Tailwind v4, react-three-fiber. The game is the whole window; menus will appear over it
only when needed. Full conventions arrive with Phase C; what is here is the structure, which is already enforced by
habit and review (`AGENTS.md` at the root, "Code style").

## Layout

```
src/
  Main.tsx, index.css        the entry and the palette tokens
  react/                     top layer: everything drawn, and the logic only one component uses, beneath that component
  store/                     middle layer: Zustand stores; may import game/ and the engine, never react/
    game/                    the game store: the engine's `World` and nothing else
  game/                      bottom layer: plain data and logic (the arenas and which match to open), no React, no store
```

An import may only point down: `react/` → `store/` → `game/`. ESLint enforces it (`eslint.config.js`): `game/` may not
import the store, React, the renderer or Zustand; `store/` may not import `react/`. A piece of logic only one component
uses still sits beneath that component, not in `game/`; `game/` is for data shared by several layers.

## State: Zustand, one library, a store per domain

Zustand is the only state library. A store is a folder under `store/` named for its subject (`store/game/`), laid out
like a Redux slice: **the store itself at the top** (`UseGameStore.ts` exports `useGameStore`, with its test beside it and
its state type in `types/`), and everything that reads from it in sub-folders, each with its own `types/`:

```
store/game/
  UseGameStore.ts, UseGameStore.test.ts
  types/GameStore.ts
  selectors/                   reads, each in a folder of its own
    select-ammo-readout/       a reactive selector for components
      SelectAmmoReadout.ts, SelectAmmoReadout.test.ts
      types/AmmoReadout.ts
    select-player-health/      the player's health, a plain number
    select-round/              where the round stands, a plain string
    select-match/              the best-of-three the world belongs to (the same object until a round is scored), or nothing
    select-seconds-until-ring/ whole seconds (rounded up) before the ring starts, or nothing when the world has no ring; changes once a second
    game-state/                `gameState()`, the one-off read for `useFrame`
      GameState.ts
```

Redux terms: `useGameStore` is the store (and `getState()` / `setState` live on it), `setWorld` is the one action, `GameStore`
is `RootState` plus the actions, and a selector is `(state) => derived value`, as in Redux. `gameState()` is the imperative
read, `store.getState().world`, that does not subscribe. New kinds of thing get a sub-folder named for what they are
(`selectors/` today), never files loose beside the store. The shape follows large Zustand codebases (Lobe Chat keeps a
folder per domain with the store, its initial state and its selectors) and the Redux style guide's feature folders alike:
group by subject, not by file type. Add a `slices/` folder inside a store only when that store has several slices.
Middleware, if any, goes on the composed store, never on a slice.

**The game store holds what the engine's `World` holds, and nothing else.** Its state is `{world, setWorld}`.

- A value worked out from the world (ammunition, health shown on screen) is a **selector**, never stored state.
- Menus, lobby, library, credits and meta state do **not** go here: they go in an app store (`store/app/`), built when a
  screen needs it, with the same conventions. Two stores because a Zustand `set` runs every mounted selector of its
  store: a world written 60 times a second must not share a store with the whole UI.
- It is enforced, not only written: lint lets `store/game/` import only `zustand`, the engine, `@src/game/**` and its own
  folder, and `UseGameStore.test.ts` pins the store's exact keys, so adding state is a deliberate edit.

**Reading it.** The loop writes the world once per frame (`setWorld`), and only when a step ran. `useFrame` and the loop
read it with `gameState()`, which does not subscribe and causes no render. A React component reads slow values with a
selector and `useShallow`: `useGameStore(useShallow(selectAmmoReadout))` re-renders only when the readout changes, which
is a few times a second at most. A per-frame value is never bound to a component (react-three-fiber's own guidance: state
managers are fine for updates that are not rapid). The decision and its sources are in `docs/state-management.md`.

**Which match opens** is chosen once, from the page's query (`game/scenario/`): none is the practice range with its dummies,
`?scenario=duel` is the duel, a best-of-three (an opponent with a brain who moves and shoots back; first to two rounds, `World.match`), `?scenario=sparring` the same arena with
an opponent who has no brain and cannot shoot, `?scenario=heights` a low-ground and platform arena (`game/heights/HeightsArena.ts`) with one
stair, a dummy on each level (`game/heights/HeightsDummies.ts`) and no opponent. It is a selector only, never a way to write state; it goes when a menu picks
the match. `worldOfPage()` builds the world (`worldOfScenario(scenario, seed, ringTiming)`) and is also what "Play again" puts in the
store. **Ring timing** is the query's other setting (`game/scenario/ring-timing/`): `?ringDelay=3` (seconds before the ring starts to close; 0 allowed) and `?ringClosing=15` (seconds it
takes to close; more than 0), each a plain number or ignored (the other half keeps the game's own, 45 and 30), read once by `ringTimingOfPage()` so every round of a match keeps it. The duel always has a ring; **sparring has one only when
the query asks for ring timing** (a spec uses it to watch the ring alone hurt a fighter who stands still); the practice range and the heights arena never do. The ring closes on a point drawn from the match's seed, so
`?scenario=duel&seed=42&ringDelay=3&ringClosing=15` replays the same ring, and each round of a match (seed + rounds played) closes on a new place. The query tunes a match's setup, never its state. The opponent's choices are drawn from a seed (`game/scenario/seed/`): `?seed=42` replays a match exactly (the
acceptance specs pin one), otherwise each page load and each "Play again" draws a fresh random one, which is the only
`Math.random` in the game.

**What the player sees** is the engine's `vision/` (`docs/game-design.md`, "Vision"): `three/arena-canvas/.../vision-overlay/` draws a dark
veil over the arena with the cone cut out (`visibleArea`, rebuilt every frame in `useFrame`), and `Opponent`, `Dummies` and `Bullets` draw
only what `visibleToPlayer(world)` says is seen. The snapshot reports the same answer (`vision`, `opponent.visible`, `dummy.visible`), since the
canvas is not in the DOM (`vision.range` is the cone's own, so it grows while the player crouches: C or either Control key, held, read by `use-game-loop/hooks/use-crouch-key/`); the veil's own drawing has no spec, only its geometry (`DimmedGeometry.test.ts`).

**Heights are drawn** by `three/arena-canvas/.../arena-heights/` (no labels): raised floor a step lighter per level (`colours/LevelColour`, the
palette's `--color-gs-floor-l1` to `l3` repeated, since WebGL cannot read CSS variables), and each stair as four bands shaded from its low floor to
its high one (`stairs/StairStripsOf`). Every edge where a raised floor drops to lower open ground (not against a wall, and not on the side a stair arrives) gets a bright lip on the raised side and a shadow on the lower ground (`drops/DropStripsOf`, `drops/DropLipColour`; `heightTilesOf` finds them), so the edge reads as a cliff. The snapshot's `player.level` is the engine's `levelAt`; the drawing itself has no spec (canvas), its
helpers have unit tests.

The HUD is plain React over the canvas (`react/components/dom/ammo-hud/`, `health-hud/`, `score-hud/` (the round and the score, top
middle, only in a match), `ring-hud/` ("Ring in 0:43", then "Ring closing", just under it, only when the world has a ring; `text/CountdownText`) and the `round-banner/` overlay that appears when a round is won or lost), styled with Tailwind and the
`--color-gs-*` tokens. In a match the banner keeps "You won" / "You lost" for a round, adds the score, and offers **"Next round"**
(`game/scenario/NextRoundOfPage.ts`: a fresh duel, the score kept, the opponent's seed the page's plus the rounds already played,
so `?seed=` still replays a whole match); when the match is decided it says "You won the match" / "You lost the match" and offers
"Play again" (a new match), as does a game with no match. `score-text/` holds the one sentence of the score both the banner and the
HUD say. **A click on a `button` is not a shot** (`use-firing/trigger/PullsTheTrigger.ts`): the trigger listens on `window`, so
without it pressing "Next round" fired a shot into the round it started. The health shows
in whole points, a part of a point rounded up (`selectPlayerHealth` is `Math.ceil`): the ring takes health a fraction at a time, so the number never reads 0 while the player stands and the
component re-renders only when the number on the screen would change; the state hook keeps the exact value. Anything
animated on a timer (the reload fill) is a CSS animation, so React never sees a per-frame value.

**The ring is drawn** by `three/arena-canvas/.../ring-edge/RingEdge.tsx`: one plane the size of the arena, above the veil and below the fighters, with a small shader (`shaders/RingEdgeVertex.glsl` and `RingEdgeFragment.glsl`: real GLSL files, so the editor highlights them, imported as strings with Vite's `?raw`; a shader goes in a `.glsl` file, not a string in a `.ts` file; `RingEdgeShaders.test.ts` compiles both with `glslangValidator`, which must be on the PATH, `docs/shaders.md`) that draws a bright
edge (a fixed 0.12 tile wide, the palette's `--color-gs-ring` repeated as a vector, since WebGL cannot read CSS) and a faint red tint on the ground outside the circle, nothing inside. `useFrame` writes the centre and radius
(`radiusOfRing`, the same circle `step` hurts by) into the material's own uniforms each frame, so no per-frame value goes through React state; **write them through `materialRef.current.uniforms`, not through the object handed to
`uniforms={...}`: the second left the radius at 0 and tinted the whole arena**. The plane is the arena, so a circle bigger than the arena is clipped by it. The canvas is not in the DOM, so `DrawingTheClosingRing` (acceptance) reads what a player sees from a screenshot, at the places the hook's
`ring.centre`, `radius` and `damagePerSecond` say the ring is, and checks the browser reported no shader error.

## Folders inside `react/`

- **One folder per component**, named in kebab-case for its file: `arena-canvas/ArenaCanvas.tsx`. Its children go in its
  `components/` folder, each in a folder of its own, however deep. The tree reads like the screen.
- **`react/components/` splits into `dom/` and `three/`.** A top-level component is `components/dom/<name>/` when it
  renders DOM (HTML, styled with Tailwind) and `components/three/<name>/` when it renders react-three-fiber objects inside
  a `<Canvas>`, so the path says which world it lives in. `react/components/three/arena-canvas/` hosts the `<Canvas>`: it is
  `three/` even though it renders a `<div>`, because it goes straight into a canvas and holds nothing but the minimum DOM
  needed to set it up (the sized wrapper and its `data-ready` hook). Anything else DOM, such as the HUD, is its own `dom/`
  component beside it, never inside it.
- **Below a top-level component, children share its kind, so there is no further split.** Everything under `arena-canvas/`
  is three: `arena-canvas/components/arena-scene/components/bullets/`, flat. A DOM component's children are DOM. If a
  `three/` tree ever needed DOM, that is a new top-level `dom/` component, not a child. Hooks, pure helpers and types are
  not components: they keep the rules below, wherever they sit.
- **A hook sits beneath the thing that calls it**, in `hooks/<kebab-name>/`. `use-game-loop/` belongs to `arena-scene/`,
  and `use-wasd-movement/` beneath `use-game-loop/`, because that is its only caller. A hook two components share rises
  to their nearest common ancestor and no further.
- **Pure helpers go in a subfolder of their caller**, named for their subject (`keys/DirectionFromKeys.ts`), and **every
  type goes in the domain's `types/` folder** (`game/camera/types/Viewport.ts`). A component's own `Props` stays in its file.
  The game loop's own helpers show the shape: `use-game-loop/clock/FixedTicks.ts` is the entry,
  `clock/limits/MaxFrameSeconds.ts` is its helper, and `clock/TickSeconds.ts` stays at the `clock/` root because the hook
  uses it too.
- A component file exports the component and nothing else. A hook file exports the hook.

## Tests

Unit tests are `node`, not jsdom: reducers, clocks and pure functions. A component is covered by an acceptance spec
(`acceptance-tests/`), through the one read-only state hook (`shared/src/state-hook/`), never by a unit test.
