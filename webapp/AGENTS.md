# AGENTS.md: webapp

The React app: Vite, React 19, Tailwind v4, react-three-fiber. The game is the whole window; menus will appear over it
only when needed. Root coding standards and the package layering below apply.

## Layout

```
src/
  Main.tsx, index.css        the entry and the palette tokens
  react/                     top layer: everything drawn, and the logic only one component uses, beneath that component
  store/                     middle layer: Zustand stores; may import game/ and the engine, never react/
    game/                    the game store: the engine's `World` and nothing else
    app/                     the app store: choices about the game around the match (today `muted`)
  sound/                     what the fight sounds like: plain logic and the browser's audio; used by react/, never imports react/ or a store
  assets/sounds/             the sound files (`files/<key>.mp3`), their keys and addresses
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

## Runtime boundaries

- `game/scenario/` chooses seeded setup once from the query. Query parameters configure a scenario, never write live state. Preserve the match score and setup when starting another round.
- Render the engine's visibility result; do not invent a second sight/height rule in React. Keep terrain dim outside the cone while suppressing hidden entities and their effects.
- HUD animation on a timer uses CSS; per-frame geometry and uniforms use `useFrame`. Update shader uniforms through `materialRef.current.uniforms`, not the object originally passed to JSX.
- Store GLSL in `.glsl` files, imported with `?raw`, and compile it with `glslangValidator` in tests. A valid shader still needs a browser drawing assertion where feasible.
- The reticle cursor belongs on the arena only. HUD pointer pass-through must not create aim dead zones; buttons and overlays retain normal interaction. A button click must not fire a weapon. Native/Retina cursor appearance requires manual inspection.
- `sound/` imports no React or store. Consume the engine's local combat events after every simulation tick, because the game store retains only the last world. Muting belongs in the app store.
- Drop sounds while the audio context is suspended; never queue them for later playback. Preserve the once-per-hold empty-click latch. `sound/damage-crunch/DamageCrunch` makes one crunch (`sfx-damage-crunch`) per burst of bullets (hits within `BURST_SECONDS`, 100 ms of game time, are merged; the window is not stretched). The ring never crunches: it hurts every step, so it wants a continuous loop (`sfx-ring-damage-loop`, requested from art; silent until then). The hit that ends a round still crunches; nothing after it does. The loop passes each step's `seconds` so `sound/` reads no clock.
- MP3 is the user-approved production format. Keep WAV masters in `audio/`; emit runtime MP3s as separate assets with `?url&no-inline`. Safari audio was accepted as good enough by user decision on 2026-11-17; preserve recorded timing findings.

## Sprite rendering

SVG assets live in `public/assets/sprites/`; `assets/sprites/` owns keys, anchors and pixels-per-tile scaling. Preserve body-centre anchors and the same scale across stances. Rasterised textures render with `toneMapped={false}`. Missing/loading pictures use the existing placeholders; `data-sprites-ready` becomes true after every load succeeds or fails, and acceptance scenarios wait for it.

**Generated weapon drawings** (`components/pickup/`, 2026-11-17): the weapon lying in the arena is the placeholder disc (`pickup-disc/`) or, when the page names a drawing, `weapon-drawing-plane/` at half scale (0.71 tile, art's rule). Nothing links a real weapon to a drawing yet (the engine's `Weapon` has no appearance), so the only way in is the seam `?weaponDrawing=lantern|refused` (`game/scenario/weapon-drawing/`: named drawings, a copy of art's `jellyfish-cage.json` that a test keeps equal to art's file, and the same lantern at version 2, so the stand-in is drawn; both ship in the production bundle). `hooks/use-weapon-drawing/` makes the texture: `appearanceToDraw` parses with the shared strict schema and a refused drawing becomes `fallbackAppearance()` (never draw `unknown`), `svg/` turns the body into a transparent SVG (structural parts only at pickup scale; only enumerated roles and checked numbers are written, so no model text reaches the markup), and `rasteriseSvg` makes the texture, counted by `spritesReadiness` so `data-sprites-ready` waits for it. `RoleColour` takes the game's palette (`RoleColour.test.ts` reads `index.css`); the body is the wall's dark (`#18212B`), so the stand-in's body is near-invisible on the dark floor (a note for art). The geometry bounds (`validateAppearance`) stay in `ai/`; an overshoot is only cut off by the picture's edge. Not done: held weapon, projectile/impact/animation presets, art's pickup diamond.

**Shots** (`components/bullets/`): `Bullets` draws two instanced meshes (`shots/Shots.tsx`), the player's in art's blue (`fx-projectile-rifle-blue`) and the opponent's in orange (`fx-projectile-rifle-orange`, matching silhouette in `#FF9B54`, retained by user choice and art review on 2026-11-17). The manifest anchors a shot on its tip (49, 32), not the picture's centre, because a bullet is a point that hits when it touches something; `shots/placement/ShotPlacementOf` turns the offset with the bullet's `direction`. Fog is unchanged (`visibleToPlayer(world).bullets`). **The game loop's `useFrame` has priority −1** (`GAME_LOOP_PRIORITY`): at the default it ran after the drawing components and everything was drawn one fixed step (0.33 tile of a rifle bullet) behind the world. No muzzle flash until feature complete (the user, 2026-11-17).

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

The `terraced` scenario preserves its arena and seeded opponent across rounds. `?scenario=overlook` (`game/overlook/`) is the terraced arena the other way round: the opponent on the platform at (12.5, 3.5), the player idle on the low ground at (1.5, 3.5), eleven tiles apart; one round, no ring, no match. `?scenario=pickup-race` (`game/pickup-race/`) is the duel's arena and fighters in one round with no ring or match, and the submachine gun lying at (17.5, 10.5): four tiles from the opponent, eight from the player. The read-only snapshot includes opponent level for stair acceptance coverage.
