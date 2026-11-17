# AGENTS.md: engine

`engine/` is the rules of gunsmith: a deterministic simulation, a package of its own so the webapp now, and the API's
Worker later, run the same code. Modelled on janggi's `engine/`. Pure TypeScript: no React, no DOM, no clock, no
`Math.random`, no I/O. A world and an input go in; the next world comes out, and the same two always give the same answer.

Inside the package a file imports another by the package's own name, `@gunsmith/engine/arena/Arena`, as janggi's does
(an `@src` alias would resolve into whichever package imports it). `webapp`, `ai` and the future `api` may import it; acceptance specs may not.
It is not in `shared/` because `acceptance-tests/` may import anything there, and a spec that recomputed its expectation
from the engine would agree with it whatever the engine did.

## What is here

One folder per subject. Each has its entry points at the top, its types in `types/`, and a subfolder for a helper only an
entry point uses. Several entry points may share a root only when they share the subject (`match/` has four, all the match);
a file that does not share it is a different domain with a folder of its own, and a helper with one caller goes beneath that
caller (`opponent/state/acting/engage/aim/` serves `Engage`). `src/` follows the same rule: its one file is `Engine.ts`, and
everything else is a domain folder. Tiles are the unit; `x` grows to the east and `y` to the north.

The package front door is `Engine.ts` (`startingWorld` and `step`), not a barrel.
Use the current code and adjacent tests to find a domain's implementation.
[Historical domain catalogue](../docs/history/2026-11-17-compaction/EngineInstructions.md#what-is-here)
retains the mechanic descriptions and earlier measurements; it is not a backlog.

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
- Property tests use `fast-check` and run separately through `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets the cases. Preserve seed/counterexample output. `power-rating/` and `weapon-balance/` own deterministic stat costs and downward balancing, including deliberate weakness. These initial coefficients require gameplay calibration.

Stair arenas use deterministic `route/` walking paths for wandering, searching and ring shelter. Flat arenas retain existing steering. Arena parsing rejects raised stair flanks that bypass landings. Engagement and cover work across levels: `EngageDirection(arena, …)` judges range by the player but closes in toward `RouteWaypoint`, so a drop is gone round by its stair; `NearestCover` hides a place by the sight rule (a platform hides from the low ground, not the reverse) and ranks it by the walk there (`WalkingDistanceTo`); `Reload` walks to cover by `RouteWaypoint`. A bot that sees the player from a stair or an edge within its normal range fights from where it is (the user's choice) and routes only to close in or reach cover. The `seek` state (`state/acting/Seek.ts`) walks to a weapon lying in the arena, by stair if need be, without firing; `ChooseState` sends the bot there from any state, in sight of the player or not, when `state/seeking/WinningTheRace` says it is nearer by walk (`state/walking/WalkingDistanceTo`) by `seekLead` tiles, and keeps it there until the player is nearer by more than `seekGrace` (`Difficulty`, both tunables for play). An empty magazine still reloads first.

`arena-symmetry/` makes starts fair without changing `Arena`: `isHalfTurnSymmetric` says whether an arena is the same picture turned half way round, `spawnPairsOf` lists the tile pairs a half turn takes onto one another (open floor, one level, no stair, reachable, `SPAWN_SPACING_STEPS` apart), `chooseStartingPlaces(arena, seed)` draws one pair and who takes which end from the seed on its own `SPAWN_SEED_SALT` stream (never an unmatched pair; `undefined` when there is none), and `startAtPlaces` stands both fighters there facing the middle. The ring centre and the pickup stay random and are not filtered. Half-turn only so far; reflection needs its own aim and input checks.
