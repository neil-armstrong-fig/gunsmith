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

- `geometry/types/`: `Point`, `Ray` (a start and a unit direction) and `Circle` (a centre and a radius).
- `arena/`: `ArenaFrom` (reads a drawing: `#` wall, `.` floor, first row on top) and `IsSolid` (outside the arena counts
  as solid). `types/Arena.ts` is a width, a height and a flat list of solid tiles.
- `movement/`: `PushOutOfWalls`, circle against the tile grid. It resolves overlap along the line from the wall's nearest
  point to the circle's centre, so a player slides along a wall. It does not sweep: the caller steps small, which is why
  `step` is called with a fixed `TICK_SECONDS` from the webapp.
- `player/`: `MovePlayer`, `AimPlayer`, and `PlayerRadius` (the body, shared with `bullet/`). `walking/PlayerSpeed.ts` is
  `MovePlayer`'s; `types/Player.ts` (position, aim, one cool-down for both weapons, the `loadout`, which weapon is in hand
  and the reload still to run, absent when there is none).
- `bullet/`: `FireBullet` (a bullet leaves the muzzle, just outside the player, carrying the damage and speed of the
  weapon that fired it) and `AdvanceBullets` (flies each on at its own speed and returns a `BulletFlight`: the bullets
  still in the air and the dummies still standing). A bullet is gone when it meets a
  wall or a dummy, whichever is nearer; a wall is found by sampling the path every 0.1 tile (so a one-tile wall cannot be
  jumped), a dummy by an exact ray-against-circle test (`hit/DistanceToCircle`, so a graze is not missed between samples).
  Every bullet is judged against the dummies as they stood at the start of the step, so two landing together both count.
  `flight/` (`DistanceToWall`), `hit/` (`DistanceToCircle`, `NearestDummyHit`), `types/` (`Bullet`,
  `BulletFlight`, `FlightRequest`, `DummyHit`).
- `dummy/`: the practice target. `HurtDummies` takes each bullet's own damage off the dummy it hit (a `Strike`: which
  dummy, how much) and drops the ones left with no health; `DummyHealth` and `DummyRadius` are tunables;
  `types/Dummy.ts` and `types/Strike.ts`. A dummy does not move, and
  the player does not collide with one yet.
- `weapon/`: what a weapon does. A `Weapon` (`types/Weapon.ts`: fire interval, bullet damage and speed, magazine size,
  reload time, starting reserve; every number a tunable set by play) lives in `weapons/` (`Rifle` in slot 1,
  `MarksmanRifle` in slot 2). `TriggerPull` (the cool-down, and no shot from an empty magazine or during a reload: a held
  trigger fires at a steady rate), `SpendRound` (a shot costs a round from the weapon in hand) and `ReloadWeapon` (R: needs
  a magazine that is not full and a reserve that is not empty; the whole reload time passes before the magazine takes what
  it needs from the reserve, or what the reserve has; asking again mid-reload does not restart it). `types/` has `Weapon`,
  `TriggerRequest`, `TriggerResult`.
- `loadout/`: what the player carries. A `CarriedWeapon` (`types/`: the weapon, rounds in the magazine, rounds in the
  reserve) is one slot of the player's `loadout`; `StartingLoadout` is both weapons, full. `SwitchWeapon` (a slot, 1 is the
  first; cancels a reload; the same slot, no slot or a slot the player does not carry changes nothing), `EquippedWeapon`
  (the weapon in hand; it throws when the index is wrong, which `SwitchWeapon` keeps from happening) and
  `WithEquippedWeapon` (put a changed one back).
- `game-loop/`: the body of the game loop: `startingWorld(arena, dummyPositions)` and `step` (switch weapon, then start or run the
  reload, so a switch and a reload asked for together reload the new weapon; walk, turn, fly the bullets on and hurt what
  they reach, then pull the trigger, so a shot fired this step first moves on the next, and a reload that finishes this
  step lets the weapon fire in it). The loop that calls `step` at a fixed rate lives in the caller (the webapp's
  `useGameLoop` today, the server's match later), because the engine has no clock. `types/World.ts` and `types/Input.ts` (direction, aim, firing, reload and the slot to switch to).

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
