# AGENTS.md: webapp

The React app: Vite, React 19, Tailwind v4, react-three-fiber. The game is the whole window; menus will appear over it
only when needed. Full conventions arrive with Phase C; what is here is the structure, which is already enforced by
habit and review (`AGENTS.md` at the root, "Code style").

## Layout

```
src/
  Main.tsx, index.css        the entry and the palette tokens
  react/                     everything drawn, and the logic only one component uses, beneath that component
```

There is no `game/` folder today. It was the home of plain, React-free logic (the clock, the camera fit, the snapshot), but
every piece had exactly one caller, so each now sits beneath that caller. A `game/` layer comes back when logic is shared
by several components, as `react/` -> `redux/` -> `game/` in the root `AGENTS.md` describes.

Per-frame state stays out of Redux (there is no Redux yet): the running world lives in a ref, read inside `useFrame`.
Per-frame values never go through React state.

## Folders inside `react/`

- **One folder per component**, named in kebab-case for its file: `arena-canvas/ArenaCanvas.tsx`. Its children go in its
  `components/` folder, each in a folder of its own, however deep. The tree reads like the screen.
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
