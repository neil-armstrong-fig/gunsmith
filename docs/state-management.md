# State management: Zustand, and a game store that holds only the world

Decided 2026-11-12 at the user's request. The earlier plan (`AGENTS.md`, `docs/architecture.md`) was Redux Toolkit for UI
state with the simulation outside it. Redux was never installed; this replaces that plan before any code depended on it.

## Decision

- **One state library: Zustand** (`zustand` 5.0.16, exact-pinned in the catalog; the version `@react-three/fiber` 9.8.2
  already depends on. 5.1.0, released 2026-11-06, was under the seven-day policy on the day).
- **A store per domain**, as folders under `webapp/src/store/`, layered `react/` → `store/` → `game/` (an import may only
  point down; ESLint enforces it).
- **Two stores, not one.** A hot **game store** now (`store/game/`), a cold **app store** later (`store/app/`: menus,
  lobby, library, credits, meta), built when a screen needs it. A Zustand `set` runs every mounted selector of its store, so
  a world written 60 times a second must not share a store with the whole UI.
- **The game store holds what the engine's `World` holds, and nothing else**: state `{world, setWorld}`. A value worked out
  from the world (the ammunition on screen) is a selector, never stored. Enforced by an ESLint allow-list on
  `src/store/game/**` (only `zustand`, `@gunsmith/engine`, `@src/game/**`, its own folder), by a unit test that pins the
  store's exact keys, and by the rule in `AGENTS.md` and `webapp/AGENTS.md`.
- **Reading it.** The loop writes the world once per frame, only when a step ran. `useFrame` and the loop read it with
  `gameState()` (`getState()`, no subscription, no render). A component reads slow values with a selector and
  `useShallow`, so it re-renders only when the values change (a few times a second at most).

## What bigger projects do

| Source | Layout | Takeaway |
| ------ | ------ | -------- |
| Redux style guide and FAQ | Feature folders, one "slice/duck" file per feature; `app/store.ts`, `app/hooks.ts` (typed hooks in their own file); local values stay in components | Group by subject, not file type: the rule this repo already has |
| Zustand docs | Slice creators combined into one bound store; `create<T>()(...)`; middleware only on the combined store; reset stores in tests with `getInitialState()` | One hook per store, no provider; slices only when a store has several |
| bulletproof-react | `src/{app,components,features,hooks,lib,stores,types,utils}`; global stores in `stores/`, feature stores in `features/<x>/stores`; one-way imports shared → features → app, enforced with ESLint | The `react → store → game` layering, enforced by lint |
| Lobe Chat (large Zustand app; real tree read through the GitHub API) | `src/store/` has 49 domain folders, one store each. A domain is `store.ts`, `initialState.ts`, `selectors.ts` (or `selectors/`), `index.ts`, and `slices/<name>/` when it has several | Many small domain stores, not one global store; selectors beside the store |
| Grafana (large Redux Toolkit app; real tree read through the GitHub API) | Explore's `state/` folder is one file per concern (`main`, `explorePane`, `query`, `history`, `time`, `datasource`, `selectors`), tests beside each; RTK's `createAction` with a hand-written reducer, plus thunks (`createSlice` not verified there) | Big RTK apps also group by feature, so `store/<domain>/` fits both camps |
| react-three-fiber, "Performance pitfalls" | "Using state-managers and selective state is fine, but not for updates that happen rapidly": read fast state with `getState()` in `useFrame` | The per-frame world is never bound to a component |

## Zustand against Redux Toolkit, for this app

- **Plumbing.** Redux needs `<Provider>`, `store.ts`, typed `hooks.ts`, `RootState` and `AppDispatch`. Zustand is one file
  per store, no provider, and reachable from `useFrame` and plain loops through `getState()`.
- **Write cost.** RTK dispatches through its middleware chain and Immer reducers; `getDefaultMiddleware` adds the
  immutability and serializability checks in development builds only (the immutability check warns past 32 ms by default).
  Zustand's `setState` is an object swap that runs the mounted selectors. Either could hold the already-immutable `World`;
  the deciding factors are plumbing, the two-store split and the r3f guidance, not raw speed.
- **What RTK does better, and we give up.** Time-travel devtools, RTK Query and listener middleware for server data, and a
  stricter event-style action log. When credits, library and account calls arrive we write fetch actions by hand or pick a
  query library then; that is not decided. Zustand has a devtools middleware for the cold app store later; it is not for the
  per-frame world.

## Not covered by a spec

The reload fill on the ammunition bar is a CSS animation of the weapon's reload time in wall-clock seconds, so it can drift
from game time on a slow frame. It is cosmetic. A redundant extra `setWorld` call in the loop would not change any result, so
no test sees it; "written once a frame, only when a step ran" is a property of `useGameLoop` held by review.

## Sources

- Zustand: [Slices pattern](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern),
  [Advanced TypeScript](https://zustand.docs.pmnd.rs/learn/guides/advanced-typescript),
  [Comparison](https://zustand.docs.pmnd.rs/learn/getting-started/comparison),
  [Testing](https://zustand.docs.pmnd.rs/learn/guides/testing) (search summary only, not opened),
  [releases](https://github.com/pmndrs/zustand/releases).
- Redux: [Style guide](https://redux.js.org/style-guide/),
  [Usage with TypeScript](https://redux.js.org/usage/usage-with-typescript),
  [configureStore](https://redux.js.org/toolkit/api/configureStore),
  [getDefaultMiddleware](https://redux.js.org/toolkit/api/getDefaultMiddleware),
  [Immutability middleware](https://redux.js.org/toolkit/api/immutabilityMiddleware).
- react-three-fiber: [Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls).
- bulletproof-react: [project-structure.md](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).
- Real trees via the GitHub API: [lobe-chat `src/store`](https://api.github.com/repos/lobehub/lobe-chat/contents/src/store),
  [grafana `explore/state`](https://api.github.com/repos/grafana/grafana/contents/public/app/features/explore/state).
- Registry facts (`npm view zustand`) and this repo's `pnpm-lock.yaml` for the version and the r3f dependency.
