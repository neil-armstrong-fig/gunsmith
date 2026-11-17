# Historical snapshot: engine/AGENTS.md

Captured 2026-11-17 before compaction. This is historical context, not active
instructions or a current task list. Relative Markdown links have been rebased.
Current source: [active document](../../../engine/AGENTS.md).

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
entry point uses. Several entry points may share a root only when they share the subject (`match/` has four, all the match);
a file that does not share it is a different domain with a folder of its own, and a helper with one caller goes beneath that
caller (`opponent/state/acting/engage/aim/` serves `Engage`). `src/` follows the same rule: its one file is `Engine.ts`, and
everything else is a domain folder. Tiles are the unit; `x` grows to the east and `y` to the north.

- `Engine.ts` (`types/Engine.ts`): the front door, `engine = {startingWorld, step}`, the two calls that run a game. The webapp's
  loop and its scenarios go through it. It is not a barrel: the arena, the match, the weapons and the rest are reached by
  their own paths.
- `geometry/types/`: `Point` (a place) and `Circle` (a centre and a radius). `Ray` (a start and a unit direction) is used
  only by `bullet/flight/`, so it lives in `bullet/flight/types/`.
- `arena/`: `ArenaFrom` (reads a drawing, first row on top: `#` wall, `.` floor on the low ground, `1` and `2` floor one and two levels
  up, and an arrow `^ v < >` a stair that climbs the way it points; it throws unless a stair has plain floor behind it and ahead of
  it, the far one exactly one level higher, so every stair has a landing at each end), `IsSolid` (outside the arena counts as solid),
  `LevelOfTile` (a stair has the level of its low end; beyond the edge, 0) and `StairOfTile` (the way a stair climbs, or `undefined`).
  `SolidTilesOf(arena)` is the `BlockedTiles` test (`types/BlockedTiles.ts`: a tile's x and y in, blocked or not out) for walls and nothing else, which is what the opponent's walking goals and cover ask (a bullet and a line of sight ask `height/`). `types/Arena.ts` is a width, a height and flat lists, one entry per tile: `solid`, `levels` and `stairs` (`TileStair`); `Uphill` is
  the list `UPHILLS` and its type; `DrawnArena` is the same lists while `ArenaFrom` still fills them. what only `ArenaFrom` uses is in
  `drawing/` (`Wall`, `Stairs`, `LevelOfCharacter`, `PlaceStairs`; the floor characters used only by `LevelOfCharacter` are under `drawing/level/`), and what only `PlaceStairs` uses is in `drawing/stairs/` (`LandingIndex`: is a
  neighbour plain floor; `UphillStep`: a direction as a step). Up to three levels (0 to 2); a stair is one tile and joins two neighbouring levels.
- `movement/`: `PushOutOfWalls(blocked, centre, radius)`, circle against the tile grid; what counts as blocked is the caller's `BlockedTiles` test
  (`arena/types/`), so a wall and a drop between levels are the same thing to it. It resolves overlap along the line from the wall's nearest
  point to the circle's centre, so a player slides along a wall. It does not sweep: the caller steps small, which is why
  `step` is called with a fixed `TICK_SECONDS` from the webapp. The root file is the loop of passes; `pushing/PushOnce` is one pass over the tiles the circle could touch,
  `pushing/tile/PushFromTile` the push from one tile, and `pushing/tile/inside/PushOutFromInside` the way out when the centre is inside it.
- `player/`: `MovePlayer(arena, walk)` (a `types/Walk`: position, direction, seconds and whether crouching; walls and `height/BlockedFrom` stop it), `AimPlayer`, and `PlayerRadius` (the body, shared with `bullet/`). `walking/PlayerSpeed.ts` and
  `walking/CrouchSpeedFactor.ts` (0.4: a crouching player keeps 40% of the speed, a tunable) are `MovePlayer`'s; `types/Player.ts` (position, aim, one cool-down for both weapons, the `loadout`, which weapon is in hand,
  `crouching`, the reload still to run, absent when there is none, and `health`). Crouching follows `Input.crouching` (optional, absent means standing; held, not toggled) each step in `PrepareFighter`. The opponent is a `Player` too.
- `bullet/`: `AdvanceBullets` is a short pipeline: `flight/MeetBullet` decides what each bullet runs into (a `Meeting`),
  then `flight/BulletsStillFlying`, `hit/StrikesOf` and `hit/DamageDealtBy` each read the meetings for one answer.
  (`flight/meeting/` holds what `MeetBullet` asks, and its own `types/Reach`.)
  `FireBullet(shooter, {from, aim, weapon, level})` (a bullet leaves the muzzle, just outside the fighter, carrying the
  damage and speed of the weapon that fired it, the `shooter`, `"player"` or `"opponent"`, and the `level` of the shooter's eye, which `game-loop/fighter/ShootFighter` reads with `height/EyeLevelAt`) and `AdvanceBullets` (flies each on at its own speed and returns a `BulletFlight`: the bullets
  still in the air, the dummies still standing and the `playerDamage` and `opponentDamage` that landed). A bullet is gone
  when it meets a wall, a dummy or the fighter on the other side, whichever is nearest: a player's bullet can hurt a dummy
  or the opponent, an opponent's can hurt the player, none hurts its own side, and the opponent's pass through dummies; a wall is found by sampling the path every 0.1 tile (so a one-tile wall cannot be
  jumped), a dummy or a fighter by an exact ray-against-circle test (`flight/meeting/DistanceToCircle`, so a graze is not missed between samples).
  Every bullet is judged against the dummies as they stood at the start of the step, so two landing together both count.
  `flight/` (`DistanceToWall(blocked, ray, distance)`, which takes any `Ray` and any `BlockedTiles` test, so a line of sight uses it too, with its own test; a bullet's is `height/BlocksSightFrom(arena, bullet.level)`, the same tiles that hide things from its shooter's eye, so a bullet stops at a wall or at ground higher than where it was fired from and flies over lower ground; its `types/` hold `Ray` and `DummyHit`),
  `flight/meeting/` (`DistanceToCircle`, `NearestDummyHit`, `DistanceToFighter`, and `FirstContact`, which decides what a
  step meets first: a target counts only if strictly nearer than the wall, and a dummy beats a fighter at the same distance),
  `hit/` (`StrikesOf`, `DamageDealtBy`), `types/` (`Bullet`, `Shooter`, `ShotRequest`, `BulletFlight`, `FlightRequest`,
  `Contact`, `Meeting`).
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
  `TriggerRequest`, `TriggerResult` (with an optional `refusal`) and `TriggerRefusal` (`"empty"`). `TriggerPull` says `"empty"` when the trigger is held on a weapon that is ready (cool-down over, not reloading) and has no rounds, whatever the reserve; a cool-down or a reload is waiting, not a refusal.
- `loadout/`: what the player carries. A `CarriedWeapon` (`types/`: the weapon, rounds in the magazine, rounds in the
  reserve) is one slot of the player's `loadout`; `StartingLoadout` is both weapons, full. `SwitchWeapon` (a slot, 1 is the
  first; cancels a reload; the same slot, no slot or a slot the player does not carry changes nothing), `EquippedWeapon`
  (the weapon in hand; it throws when the index is wrong, which `SwitchWeapon` keeps from happening) and
  `WithEquippedWeapon` (put a changed one back).
- `health/`: `PlayerHealth` and `OpponentHealth` (100 each, tunables) and `TakeDamage` (stops at zero).
- `round/`: `DecideRound` (`playing | won | lost` from the two healths: the player at zero loses, even when both fall in the
  same step; the opponent at zero wins; with no opponent the round only ends if the player falls). `types/` has
  `RoundState` and `RoundHealth`.
- `match/`: the best-of-three a duel is. A `Match` (`types/Match.ts`: the rounds each side has won and the round being fought,
  from 1) is plain data, optional on the `World` (`World.match`; absent in the practice range and sparring, which stay one
  endless round). `StartMatch`, `ScoreRound(match, round)` (a won round is the player's, a lost one the opponent's, one still
  being fought nobody's), `DecideMatch` (`playing | won | lost`: the first side to `winning/RoundsToWin`, 2, a tunable) and `NextRound`
  (the score kept, the round number up one). `step` scores a round once, in the step that decides it; the frozen world after
  it never scores it again. A simultaneous kill is the opponent's round, as `DecideRound` already says. Starting the next
  round's world (full health, full magazines, back at the start) is the caller's, since the engine has no arena of its own:
  the webapp's `nextRoundOfPage`.
- `ring/`: the round's closing ring (the clock, the circle, its damage, and the bot walking in from it: that part is `opponent/shelter/`). A `Ring` (`types/Ring.ts`: `roundSeconds`, how much of the round has been played; the `centre` it closes
  on; the `startRadius` that covers the arena; its `timing`, `types/RingTiming.ts`: `startDelaySeconds` and `closingSeconds`, and an optional `damageScale`, how many times the normal damage it does, 1 when absent) is plain data, optional on the `World` (`World.ring`; the duel has one, sparring only when the page
  asks for ring timing, the practice range and the heights arena never). Root, six files: `StartRing(request)` (a `types/RingRequest`: the arena, where each fighter starts, the seed and the timing; none of the round played, the centre
  from `centre/ReachableCentre`, the start radius the distance to the arena's farthest corner so the ring covers all of it), `AdvanceRing(ring, seconds)`, `SecondsUntilRing(ring)` (the start delay less the round played, never below 0),
  `ClosingProgress(ring)` (0 until the ring starts, a straight line to 1 over the closing time, 1 after; used by the radius and the damage), `RadiusOfRing(ring)` (the start radius until the ring starts, a straight line down to
  `radius/FinalRingRadius`, 2 tiles, then that; a pure function of the clock, so a round replays from its seed and inputs; a ring that began smaller than the final radius never grows) and `DefaultRingTiming` (45 s then 30 s, tunables; the
  webapp's duel uses it, so it stays at the root). `centre/`: `ReachableCentre(request)` is the middle of one floor tile that every fighter can walk to, drawn from the seed on a stream of its own (`seed/RingSeedSalt` is mixed in, so the ring never
  shares draws with the opponent's brain: a pinned duel plays as it did before the ring had a centre), the tiles put in row order first so the order the fighters are listed in does not matter; `reach/TilesReachableFrom(arena, start)` is a
  4-connected flood fill that honours `height/BlockedFrom` from each tile, so a platform is reachable only by its stair; walking is symmetric, so the fighters either share ground or cannot reach each other, and the latter throws (as `ArenaFrom` does for a
  bad drawing). `damage/`: `RingDamageRate(ring)` (nothing until the ring starts, then a straight line from `rate/MinimumRingDamage`, 2 a second, to `rate/MaximumRingDamage`, 20, over the closing time, and 20 after, so a round the ring is
  deciding always ends; the whole line times the ring's `damageScale`, which the page's `?ringDamage=` sets so a spec can boost it) and `RingDamageOver(ring, point, seconds)` (the rate for the seconds, for a fighter beyond the edge, which is `over/OutsideRing`; the edge itself is safe). `step` advances the ring's clock while the round is `playing`
  (so it stops when the round is decided, unlike `elapsedSeconds`, which keeps running so a wait on it never hangs), then takes the ring's damage, at the rate the ring has at the end of the step, off each fighter outside it with any bullet damage, before the
  round is decided: both falling in one step is the opponent's win, as any simultaneous kill is. Bullets and dummies ignore the ring. **Not built yet:** the ring's escape time
  as an arena check, and a centre that is fair to both starts (it may fall close to one of them; art's fairness study is the place for it).
- `random/`: `NextRandom(seed)` is a mulberry32 generator whose whole state is the seed, handed back with each draw
  (`types/RandomDraw`), so it sits in the `World` as plain data. The engine has no `Math.random`; the caller picks the seed.
- `opponent/`: a small bot, a finite state machine, to test weapons and arenas against. It exists to be played against, so it
  is weapon- and map-agnostic, beatable and legible, not clever. `ThinkOpponent(world, seconds)` returns an `OpponentDecision`:
  an `Input` like a player's, so it is played by the same rules, and the `OpponentBrain` it carries into the next step. The
  brain (`types/OpponentBrain`) is plain data in `World.opponentBrain`: state, goal, last-seen point, timers, strafe side,
  stuck watch and the seed. Each step it looks (`sight/CanSee`: inside its own `vision/` cone, so it must turn to look, with a clear line; `NoticePlayer` keeps
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
  goal (or flips its strafe side). The four states sit in `state/acting/` beneath `ActOnState`, each with its helpers beside it:
  `engage/` (with `aim/`) and `reload/` (with `cover/`). Every tunable is one field of `Difficulty.ts`. `brain/StartingBrain` and `GiveOpponentBrain(world,
seed)` give an opponent a brain; **an opponent with no brain takes no action at all** (the still target of sparring), and
  `DisarmOpponent` empties its magazines and takes its brain away. **Sheltering from the ring** (`shelter/ShelterFromRing`, run after the state has acted): once the ring has started to close (`ClosingProgress` above 0), an opponent nearer the edge than `DIFFICULTY.ringMargin` (2 tiles, a tunable) or beyond it walks to the ring's centre instead of where its state sent it, but keeps firing, reloading and aiming at the player while it sees them (when it does not, it looks where it walks); before the ring closes, or with no ring (`OpponentContext.ring`, absent), nothing changes, and the brain is never touched. With no pathfinder a pillar between it and the centre would jam it, so `shelter/waypoint/WaypointToward` picks the nearest of 16 directions at two short reaches that it can walk to in a straight line, preferring one from which the centre is in clear sight; no memory, no random draw. A ring that closes faster than it can walk round a pillar can still catch it (seed 10 of 40 at a 6 s closing loses 5 health), and an arena whose centre cannot be walked to from where it stands is the ring-escape validator's business, not built. Its walking goals and its cover use `vision/sight/HasClearLine` with `SolidTilesOf` (walls only), not the sight test below, so it does not yet know a stair from a drop. Browser specs watch it engage, move, run its magazine down, reload
  and refill; `search` has no assertion of its own in a browser (it happens in every seed, but only the pinned fight's timing
  would notice it go). The engine tests and `ThinkOpponentOverAMatch.test.ts` (20 seeds: kills a standing player within 15 s,
  never in a wall, replays exactly, wanders a minute without getting stuck; and, in a ring, never loses a point of health to it over 20 seeds and ends inside the final ring) carry the states.
- `pickup/`: the weapon lying in the arena. A `Pickup` (`types/Pickup.ts`: the `position`, the middle of a tile, and the `weapon` it holds) is plain data, optional on the `World` (`World.pickup?`; the duel and sparring have one, the practice range and the heights arena never, since they have no opponent to be as far from) and gone once taken. Root, two entry points: `StartPickup(request)` (a `types/PickupRequest`: the arena, where each fighter starts, the seed and the weapon) puts it on the floor tile nearest to equally far from every start by the way they would walk (`placement/RouteDistancesFrom`: steps, `height/BlockedFrom` honoured, so a stair is the only way across a drop), never under a fighter, drawn from the seed on a stream of its own among the tiles that tie, in row order (`placement/PickupSeedSalt`, so no pinned duel seed moves); it throws if the fighters cannot walk to each other. `TakePickup(pickup, fighters)` (a `types/PickupTaking`) gives it to a fighter with health left within `taking/PickupReach` (0.5 tile, a tunable) by the same rule for the player and the opponent: the nearer takes it, an exact tie is the opponent's, and `taking/WithPickedUpWeapon` puts its weapon in slot 2, in hand, with a full magazine and its starting reserve (a reload is cancelled; the replaced weapon is thrown away, not left on the floor; this one function is the place to change the rule). `step` calls it last, so a fighter who falls in the same step takes nothing and a frozen world takes nothing. The weapon is `weapon/weapons/SubmachineGun`, a fixed placeholder. `VisibleToPlayer.pickup` is the cone's answer, like a dummy's.
- `combat-events/`: what happened to the **local player** in one step, for the caller to show or play (a sound, a flash). `EventsOfStep({playerTurn})` (a `types/EventsRequest`) returns the `CombatEvent`s (`types/`: a union, today `FireRefusedEvent` `{kind: "fireRefused", reason}`, the empty click's source), or `undefined` when nothing happened. It is given the player's turn **only**, so the opponent's empty trigger, or anything hidden, cannot leave through it. `step` puts the result in `World.events`, which holds **that step's events and no others**: the frozen-round branch sets it to `undefined`, so a click can never replay under the round overlay. The webapp reads it after every tick, not every frame, because the store keeps only the last world. Planned next, in this domain: `damageTaken {cause: bullet|ring, amount}` and `hitLanded` (visible targets only), from `docs/art/concepts/combat-feedback/Handover.md`.
- `vision/`: what a fighter sees in detail. A `Cone` (`types/Cone.ts`: apex, aim, half angle in radians, range, `eyeLevel`) is what `ConeOf(arena, fighter)`
  builds from the fighter's position and aim, the level they stand on and the **weapon in hand** (`Weapon.visionDegrees`, `visionRange`; 90 degrees, 12 tiles
  for the rifle and 16 for the marksman rifle, tunables). Root, the three entry points: `ConeOf`,
  `VisibleToPlayer(world)` (`{opponent, dummies, bullets}` booleans: what the player sees, and the same answer the server will use to decide
  what to send; the player's own bullets always show, the opponent's only in the cone) and `VisibleArea(arena, cone)` (the outline of the cone
  with the walls and the higher ground cut out, always 50 points, for drawing the dim veil). Beneath: `sight/CanSeePoint(arena, cone, point)` (inside the cone and a clear
  line **for that eye level**: `height/BlocksSightFrom`; also the opponent's `CanSee`) and `sight/HasClearLine(blocked, from, to)` (a line is clear when it meets no tile the `BlockedTiles` test blocks;
  sight and bullets pass `BlocksSightFrom`, the opponent's goals pass `SolidTilesOf`); `cone/IsInCone` (one caller, `CanSeePoint`; compares the
  cosine, so no angle wraps) and `outline/ReachAlong` (one caller, `VisibleArea`; finds a wall's face by halving the last sample's gap, so the
  outline sits on the wall and not a sample inside it). `cone/CrouchRangeFactor` (1.5, a tunable; one caller, `ConeOf`) multiplies the range of a crouching fighter and leaves the angle and the aim alone; the opponent never crouches yet. Not built yet: sound, the cover and quiet that crouching is also meant to buy, and a longer reach from higher ground (an idea to try after the blocking has been played).
- `height/`: levels and stairs, slice 1 (walking) and slice 2 (seeing). `BlockedFrom(arena, standingAt)` is the `BlockedTiles` test for a walker at that point: every wall,
  and every tile on a level they cannot step to from where they stand. From a level they walk onto floor of that level and onto a stair
  that joins it; from a stair, onto floor of either level it joins; so a stair is the only way across a drop, and the drop is a wall to
  the level below and the level above. It judges from where the walker **stood**, not where the step ends, so one long step cannot jump
  a drop. `LevelAt(arena, point)` is the level of the tile, or half way (`level + 0.5`) anywhere on a stair; the snapshot reports it. `EyeLevelAt(arena, point)` (callers: `vision/ConeOf` and `game-loop/fighter/ShootFighter`, so it lives here) is the level a viewer or shooter looks from: the level of their ground, or the **upper** level while they are on a stair. `BlocksSightFrom(arena, eyeLevel)` is the `BlockedTiles` test for sight: every wall, and every tile on a level higher than the viewer's eye
  (a stair has the level of its low end), so from the low ground a platform and what stands on it are hidden, and its edge hides what lies behind, while from a platform the ground below and the platform itself
  show; walls still block everything. No sloped line of sight, and no cover with a height yet, so "higher ground sees over lower cover" waits for cover. A
  stair's flanks are not checked: a raised tile beside a stair's middle can be entered from the stair, so arenas keep stairs between walls
  or low ground (an arena validator is to come). Bullets follow the same rule (slice 3): a bullet keeps the eye level of its shooter and is stopped by `BlocksSightFrom` at that level, so from the low ground a platform's face stops your shots and from a platform they fly out over the low ground. **Not built yet:** cover with a height, the opponent walking stairs (it picks goals it can see and drops one it cannot reach, so it is not
  at home in an arena with levels), three-level arenas in play, and the ring's escape time by the stairs.
- `game-loop/`: the body of the game loop: `startingWorld(arena, dummyPositions, opponentPosition?)` (the opponent faces west
  with the same weapons and 100 health, and no brain: `giveOpponentBrain` adds one) and `step`. Each fighter, the player by
  the `Input` and the opponent by what `thinkOpponent` asks for, takes their own part by the same rules (`fighter/PrepareFighter`: switch weapon, then start or run the
  reload, so a switch and a reload asked for together reload the new weapon; walk, turn, judge the trigger). Then the bullets
  fly on and hurt what they reach, then the triggers are let go (`fighter/ShootFighter`), so a shot fired this step first
  moves on the next, and a reload that finishes this step lets the weapon fire in it. Health falls, the round is decided
  and, in a match, scored once, and once it is not `playing` the world is frozen: only `elapsedSeconds` runs on, so a wait on the clock never hangs (the ring's own clock stops too). The loop that calls `step` at a fixed rate lives in the caller (the webapp's
  `useGameLoop` today, the server's match later), because the engine has no clock. `types/World.ts` (now with `opponent?`, `opponentBrain?`, `round`, `match?`, `ring?` and `pickup?`) and `types/Input.ts` (direction, aim, firing, reload and the slot to switch to).

`Step`'s tests are split by subject in `game-loop/step/` (`StepWalking`, `StepFiring`, `StepDummies`, `StepWeapons`, `StepRound`, `StepOpponent`, `StepRing`, `StepPickup`, `StepEvents`, each a `.test.ts`), because one file of a hundred cases was too long to read; their shared fixtures (`TICK`, `IDLE`, `arena`, `walking`, `centred`, `sparring` and the rest) are one export per file in `game-loop/step/testing/`. A new case goes in the file for its subject, not in a new catch-all.

Several entry points here have a single caller (`AdvanceBullets`, `AimPlayer`, `TriggerPull`, `PushOutOfWalls` are called
only by `step` or `MovePlayer`). They stay in domain folders of their own, not beneath that caller, on purpose: these are
the engine's vocabulary, each will grow (hits, health, dummies) and be used from more than one place, and `engine/` is
imported by other packages. A single-caller helper that is _not_ a domain still goes beneath its caller.

A new subject (`ring/`, `sound/`) gets a folder of its own rather than joining a bucket. Past about six
files a folder is a smell: split it by subject.

## Conventions

- **A new rule gets a unit test first** (`it(...)` at the top level, no `describe`), watched to fail, then mutation-proved.
  Wall, edge and corner cases are where this package has been wrong before; test each side, not one.
- **The engine does not trust its input.** `step` caps the direction's length, so a client cannot walk faster by asking.
- **Audit the folder before saying done.** For each new or changed domain folder, list its files and, for every root file, count its
  callers (`grep -rln "<domain>/<Name>\"" engine/src webapp/src`): one caller means it goes in a subject-named subfolder beneath that
  caller; two or more domains means it stays at the owning root. Every interface is in `<domain>/types/`. A root of more than about five
  entry points needs a reason (`vision/` has five, all about seeing). Move a file with its test, with plain `mv`.
- **A step never changes the world it is given**; it returns a new one.
- **Tunables are constants in their own file** (`PlayerSpeed.ts`) until there are enough to want a table.
- Property tests (`fast-check`) are deliberately not here yet.
