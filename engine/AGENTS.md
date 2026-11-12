# AGENTS.md: engine

`engine/` is the rules of gunsmith: a deterministic simulation, a package of its own so the webapp now, and the API's
Worker later, run the same code. Modelled on janggi's `engine/`. Pure TypeScript: no React, no DOM, no clock, no
`Math.random`, no I/O. A world and an input go in; the next world comes out, and the same two always give the same answer.

Inside the package a file imports another by the package's own name, `@gunsmith/engine/arena/Arena`, as janggi's does
(an `@src` alias would resolve into whichever package imports it). Only `webapp`, and later `api` and `ai`, may import it.
It is not in `shared/` because `acceptance-tests/` may import anything there, and a spec that recomputed its expectation
from the engine would agree with it whatever the engine did.

## What is here

One folder per subject. Each has its entry points at the top, its types in `types/`, and a subfolder for a helper only an
entry point uses. Tiles are the unit; `x` grows to the east and `y` to the north.

- `geometry/types/Point.ts`.
- `arena/`: `ArenaFrom` (reads a drawing: `#` wall, `.` floor, first row on top) and `IsSolid` (outside the arena counts
  as solid). `types/Arena.ts` is a width, a height and a flat list of solid tiles.
- `movement/`: `PushOutOfWalls`, circle against the tile grid. It resolves overlap along the line from the wall's nearest
  point to the circle's centre, so a player slides along a wall. It does not sweep: the caller steps small, which is why
  `step` is called with a fixed `TICK_SECONDS` from the webapp.
- `player/`: `MovePlayer`, `AimPlayer`, and `PlayerRadius` (the body, shared with `bullet/`). `walking/PlayerSpeed.ts` is
  `MovePlayer`'s; `types/Player.ts`.
- `bullet/`: `FireBullet` (a bullet leaves the muzzle, just outside the player) and `AdvanceBullets` (flies them on,
  sampling the path every 0.1 tile so a one-tile wall cannot be jumped, and drops a bullet that touches a wall).
  `flight/BulletSpeed.ts`; `types/Bullet.ts`.
- `weapon/`: `TriggerPull` (the cool-down: a held trigger fires at a steady rate). `firing/FireInterval.ts`;
  `types/TriggerResult.ts`.
- `game-loop/`: the body of the game loop: `startingWorld` and `step` (walk, turn, fly the bullets on, then pull the trigger, so a shot
  fired this step first moves on the next). The loop that calls `step` at a fixed rate lives in the caller (the webapp's
  `useGameLoop` today, the server's match later), because the engine has no clock. `types/World.ts` and `types/Input.ts`.

Several entry points here have a single caller (`AdvanceBullets`, `AimPlayer`, `TriggerPull`, `PushOutOfWalls` are called
only by `step` or `MovePlayer`). They stay in domain folders of their own, not beneath that caller, on purpose: these are
the engine's vocabulary, each will grow (hits, health, dummies) and be used from more than one place, and `engine/` is
imported by other packages. A single-caller helper that is _not_ a domain still goes beneath its caller.

A new subject (`visibility/`, `ring/`, `health/`) gets a folder of its own rather than joining a bucket. Past about six
files a folder is a smell: split it by subject.

## Conventions

- **A new rule gets a unit test first** (`it(...)` at the top level, no `describe`), watched to fail, then mutation-proved.
  Wall, edge and corner cases are where this package has been wrong before; test each side, not one.
- **The engine does not trust its input.** `step` caps the direction's length, so a client cannot walk faster by asking.
- **A step never changes the world it is given**; it returns a new one.
- **Tunables are constants in their own file** (`PlayerSpeed.ts`) until there are enough to want a table.
- Property tests (`fast-check`) are deliberately not here yet.
