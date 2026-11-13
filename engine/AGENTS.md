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
  `MovePlayer`'s; `types/Player.ts` (position, aim, one cool-down for both weapons, the `loadout`, which weapon is in hand,
  the reload still to run, absent when there is none, and `health`). The opponent is a `Player` too.
- `bullet/`: `AdvanceBullets` is a short pipeline: `flight/MeetBullet` decides what each bullet runs into (a `Meeting`),
  then `flight/BulletsStillFlying`, `hit/StrikesOf` and `hit/DamageDealtBy` each read the meetings for one answer.
  `FireBullet(shooter, {from, aim, weapon})` (a bullet leaves the muzzle, just outside the fighter, carrying the
  damage and speed of the weapon that fired it and the `shooter`, `"player"` or `"opponent"`) and `AdvanceBullets` (flies each on at its own speed and returns a `BulletFlight`: the bullets
  still in the air, the dummies still standing and the `playerDamage` and `opponentDamage` that landed). A bullet is gone
  when it meets a wall, a dummy or the fighter on the other side, whichever is nearest: a player's bullet can hurt a dummy
  or the opponent, an opponent's can hurt the player, none hurts its own side, and the opponent's pass through dummies; a wall is found by sampling the path every 0.1 tile (so a one-tile wall cannot be
  jumped), a dummy or a fighter by an exact ray-against-circle test (`hit/DistanceToCircle`, so a graze is not missed between samples).
  Every bullet is judged against the dummies as they stood at the start of the step, so two landing together both count.
  `flight/` (`DistanceToWall`, which takes any `Ray`, so a line of sight uses it too), `hit/` (`DistanceToCircle`,
  `NearestDummyHit`, `DistanceToFighter`, and `FirstContact`, which decides what a step meets first: a target counts only
  if strictly nearer than the wall, and a dummy beats a fighter at the same distance), `types/` (`Bullet`, `Shooter`,
  `ShotRequest`, `BulletFlight`, `FlightRequest`, `DummyHit`, `Contact`, `Reach`).
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
- `health/`: `PlayerHealth` and `OpponentHealth` (100 each, tunables) and `TakeDamage` (stops at zero).
- `round/`: `DecideRound` (`playing | won | lost` from the two healths: the player at zero loses, even when both fall in the
  same step; the opponent at zero wins; with no opponent the round only ends if the player falls). `types/` has
  `RoundState` and `RoundHealth`.
- `random/`: `NextRandom(seed)` is a mulberry32 generator whose whole state is the seed, handed back with each draw
  (`types/RandomDraw`), so it sits in the `World` as plain data. The engine has no `Math.random`; the caller picks the seed.
- `opponent/`: a small bot, a finite state machine, to test weapons and arenas against. It exists to be played against, so it
  is weapon- and map-agnostic, beatable and legible, not clever. `ThinkOpponent(world, seconds)` returns an `OpponentDecision`:
  an `Input` like a player's, so it is played by the same rules, and the `OpponentBrain` it carries into the next step. The
  brain (`types/OpponentBrain`) is plain data in `World.opponentBrain`: state, goal, last-seen point, timers, strafe side,
  stuck watch and the seed. Each step it looks (`sight/CanSee`: within `sightRange` and a clear line; `NoticePlayer` keeps
  the last-seen point and how long it has been in sight), checks transitions (`state/ChooseState`), lets its state act
  (`state/ActOnState`), then notices if it has walked a while without getting anywhere (`steering/WatchForStuck`, answered by
  `unstick/UnstickBrain`). The states: **wander** (walk to a random open tile it can see, re-pick on arrival, after
  `wanderRepickSeconds` or when stuck), **engage** (after `reactionSeconds` hold the trigger for `burstShots` shots of the
  weapon in hand, rest, repeat; the aim misses by a per-burst angle that settles from `widestAimError` to
  `narrowestAimError` over `aimSettleSeconds` of sight; close in beyond `farRange`, back off inside `nearRange`, circle in
  between and change sides every second or two), **reload** (an empty magazine, from any state: make for the nearest cover
  it can walk to in a straight line, circle in the open when there is none, ask to reload, or ask for its other weapon when
  the one in hand has no rounds and no reserve) and **search** (walk to where it last saw the player, wait
  `searchLingerSeconds`, wander again). There is no pathfinder: goals are only ever tiles it can see, and a stuck bot drops its
  goal (or flips its strafe side). Every tunable is one field of `Difficulty.ts`. `StartingBrain` and `GiveOpponentBrain(world,
seed)` give an opponent a brain; **an opponent with no brain takes no action at all** (the still target of sparring), and
  `DisarmOpponent` empties its magazines and takes its brain away. `sight/HasClearLine` is the line-of-sight test (a bullet's
  wall test, so what it cannot see a bullet cannot hit). Browser specs watch it engage, move, run its magazine down, reload
  and refill; `search` has no assertion of its own in a browser (it happens in every seed, but only the pinned fight's timing
  would notice it go). The engine tests and `ThinkOpponentOverAMatch.test.ts` (20 seeds: kills a standing player within 15 s,
  never in a wall, replays exactly, wanders a minute without getting stuck) carry the states.
- `game-loop/`: the body of the game loop: `startingWorld(arena, dummyPositions, opponentPosition?)` (the opponent faces west
  with the same weapons and 100 health, and no brain: `giveOpponentBrain` adds one) and `step`. Each fighter, the player by
  the `Input` and the opponent by what `thinkOpponent` asks for, takes their own part by the same rules (`fighter/PrepareFighter`: switch weapon, then start or run the
  reload, so a switch and a reload asked for together reload the new weapon; walk, turn, judge the trigger). Then the bullets
  fly on and hurt what they reach, then the triggers are let go (`fighter/ShootFighter`), so a shot fired this step first
  moves on the next, and a reload that finishes this step lets the weapon fire in it. Health falls, the round is decided,
  and once it is not `playing` the world is frozen: only `elapsedSeconds` runs on, so a wait on the clock never hangs. The loop that calls `step` at a fixed rate lives in the caller (the webapp's
  `useGameLoop` today, the server's match later), because the engine has no clock. `types/World.ts` (now with `opponent?`, `opponentBrain?` and `round`) and `types/Input.ts` (direction, aim, firing, reload and the slot to switch to).

Several entry points here have a single caller (`AdvanceBullets`, `AimPlayer`, `TriggerPull`, `PushOutOfWalls` are called
only by `step` or `MovePlayer`). They stay in domain folders of their own, not beneath that caller, on purpose: these are
the engine's vocabulary, each will grow (hits, health, dummies) and be used from more than one place, and `engine/` is
imported by other packages. A single-caller helper that is _not_ a domain still goes beneath its caller.

A new subject (`visibility/`, `ring/`) gets a folder of its own rather than joining a bucket. Past about six
files a folder is a smell: split it by subject.

## Conventions

- **A new rule gets a unit test first** (`it(...)` at the top level, no `describe`), watched to fail, then mutation-proved.
  Wall, edge and corner cases are where this package has been wrong before; test each side, not one.
- **The engine does not trust its input.** `step` caps the direction's length, so a client cannot walk faster by asking.
- **A step never changes the world it is given**; it returns a new one.
- **Tunables are constants in their own file** (`PlayerSpeed.ts`) until there are enough to want a table.
- Property tests (`fast-check`) are deliberately not here yet.
