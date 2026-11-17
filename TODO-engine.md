# TODO: engine

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: worktree `.claude/worktrees/engine`, branch `worktree-engine`, last merged committed main `2d7c568` (merge commit `994dc7c`, 2026-11-17). Sync main into the clean worktree before new work and delivery; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout). Dev ports: 3400 (dev) and 3401 (preview) were mine; stop only your own.

`damageTaken` and `hitLanded` events are committed (`91b06c9`) and merged with play's own `damageTaken` (main's structure, `damage-taken/`, plus my `visibleHits`); shapes in HANDOFF's "Combat events" row, play's slice 3 consumes `hitLanded`. `validateArena` (`engine/src/arena-validation/`, uncommitted for the user's review) is built: noFloor and disconnected floor, all problems at once, never throws; the four built-in arenas pass (`webapp/src/game/built-in-arenas/`). ai asked for it and its first slice is shaped for their repair call. Bot pickup-seeking is committed (`cedece1`): the `seek` state, `WinningTheRace`, `?scenario=pickup-race` and spec `TheOpponentFetchingTheWeapon`. `seekLead` (2) and `seekGrace` (1) in `opponent/Difficulty.ts` are guesses: try a real duel (`?scenario=duel&seed=...`) and walk away from the weapon: the bot then breaks off to take it, since it starts equally far from both. Cross-level engagement/cover is merged (`4d058dc`): extend it, do not restart. Server session adds `stepFighters` and `visibleToSeat` in its worktree (asked and agreed 2026-11-17); merge main once the user has integrated them.

Current milestone: M1–M3; the project remains on M1. Next failing test/check: the next unchecked item below, likely arena finalisation/validation (symmetrical spawn pairs and built-in quality), or the inventory data play needs; either starts with a watched-red test.

## Ownership

engine/ rules, combat event production, deterministic rating/balancing, arena validators and engine-owned shared vocabulary; matching acceptance scenarios.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

play needs damage/hit events and inventory data. AI owns inferred preferences; engine owns their deterministic application. Coordinate with play before editing shared files.

## Current milestone tasks

- [ ] Agree and implement local damageTaken/hitLanded events and inventory data needed by play, test-first; preserve per-tick clearing and visible-target privacy. **`damageTaken` is done (play wrote it 2026-11-17 in worktree `play` with the user's leave, so engine does not duplicate it; see HANDOFF contract row): `EventsRequest.damage` carries `{health, bullet, ring}` and `combat-events/damage-taken/DamageTakenEvents` caps by cause. Still engine's: `hitLanded` and inventory data.** **Foundation exists (2026-11-17, committed `8acad87`):** `engine/src/combat-events/` (`EventsOfStep({playerTurn})` returns `readonly CombatEvent[] | undefined`; `World.events` holds one step's events and every `step` return sets it, the frozen branch to `undefined`; `types/CombatEvent` is a union, today `FireRefusedEvent`). To add: `DamageTakenEvent {kind: "damageTaken", cause: "bullet" | "ring", amount}` (in `Step.ts` the bullet and ring damage are summed into `hurt(...)`, so keep the two apart first; the amount is what the health actually lost, so a hit on a fighter with 3 health says 3) and `HitLandedEvent {on: "opponent" | "dummy"}` only for targets in `visibleToPlayer(world)` at the time of the hit (a hidden target emits nothing; `AdvanceBullets`/`BulletFlight` currently report only the damage sums, not which target was hit). Extend `EventsRequest` (add fields, never the opponent's turn: the guarantee that nothing about the opponent leaves is structural) and unit-test each side, with `StepEvents.test.ts` for the step. Ring onset is the webapp's to coalesce (one cue per exposure) from `damageTaken` events whose cause is `ring`, which arrive every step the fighter is outside. Agree the event shapes in `HANDOFF.md` first (its contract row is written for the next slices); play consumes them.

- [x] Cross-level engagement and cover (2026-11-17, `4d058dc`): the bot fights from where it is, closes in by `RouteWaypoint`, and takes cover by the walk there; `?scenario=overlook` and `TheOpponentComingDownFromThePlatform` cover it. **Not done:** a bot that climbs further from a stair, a levelled best-of-three, and `ShootingAcrossLevels` ("Failed to see the dummy at 4.5, 3.5 lose health") flakes 4 to 5 of 20 repeats in isolation under load, on old main (`82ed0df`) as well as now: an open flake to fix.
- [x] Bot pickup-seeking (2026-11-17, uncommitted): a `seek` state the bot enters from any state, mid-fight included, when it wins the walk to the weapon by `seekLead` tiles; `?scenario=pickup-race` and `TheOpponentFetchingTheWeapon`; 17 engine mutants killed. The bot does not seek a weapon outside the ring's safe ground. **Not done:** a stuck seek is not recovered (pinned by a test, rare), and a feel pass and tuning of `seekLead`/`seekGrace` with play (it triggers in duels only when the player moves away from the weapon: measured 40 of 40 rounds, 1.3 s at most).
- [x] Merge duplicated pickup/ring route-distance logic (2026-11-17): every flood fill (`RouteDistancesFrom`, `ReachableCentre`, `TilePathBetween`, `OpenRegionsOf`) now goes through `walkingRoutesFrom`/`walkableNeighbours`. Stair-flank access is rejected at parse time (`CheckStairFlanks`). **Still open:** validate routes to high ground and ring escape as diagnostics.
- [x] Structural arena validator (2026-11-17, uncommitted): `validateArena(arena)` returns `ArenaProblem[]` (`noFloor`, `disconnected`, each with a reason and a tile), 5 mutants killed, plus six property tests (`arena-validation/property-tests/`, in `pnpm test:properties`: never throws on any arena, no-floor iff all wall, regions partition the floor and no step leaves one, a flat-arena oracle by plain adjacency, half-turn and both mirrors give the same problems, opening a wall beside floor never adds a problem; 4 more mutants killed). **The properties do not cover stair or height rules**: random arenas rarely have legal stairs and `blockedFrom` ignores a stair's direction, so a hand-built `Arena` (not drawn through `arenaFrom`) with a stair that has raised floor beside it is accepted. Enhance later with a constructive stair generator and a stair-legality check. **Not built, and why:** a clearance check, since every cardinal route edge runs at least 0.5 from any wall corner and `PLAYER_RADIUS` is 0.4, so a counterexample cannot exist while that holds (reasoned, not a property test); a stair-landing check, since arenaFrom already throws for a missing landing and a landing is plain floor in the same region. **Next for ai's generation:** bounds/size limits, wall density, single-tile corridors (a limits constant, ai's (d)), the built-in arena pool as one engine-owned list ((c); ai drops its injected pool when it lands), start reachability once starts exist.
- [ ] Implement symmetrical arena finalisation/validation (spawn pairs and symmetry still open) from [the fairness handover](docs/art/arena-fairness-research.md): matching spawn pairs, transformed stairs/heights, clearance and built-in quality. Preserve random weapon placement and the user's unchanged random ring centres; escape measurements are diagnostics, not centre filters.
- [ ] Extend visibility fixtures as mechanics land: weapon/stance changes, cone edges/full turns, wall/height occlusion, dim terrain versus revealed entities. Multiplayer must exclude hidden entities and effects from snapshots.
- [ ] Hitscan and additional weapon behaviors, penetrable cover, full three-level play and seeded spawn placement. Extend existing implementations rather than rebuilding them.

## Later tasks

- [ ] Coordinate M2 review of engine-owned weapon/arena schemas with real consumers. AI owns adapter outcomes, budget owns ledger/credit config, art owns manifest, server owns wire contracts; do not implement their domains here.

- [ ] Extend and calibrate the merged initial power rating/caps/balancer with AI; preserve deliberate weakness. Do not treat initial implementation as calibrated production policy.
- [ ] Arena validity: bounds, open space, spawn/pickup reachability, wall/height limits, legal stairs and ring escape, for built-ins and generated arenas alike.
- [ ] Deterministic output moderation: text length, charset and blocklist.
- [ ] Extend the property tests (arena connectivity done 2026-11-17) to caps and directional visibility; prove no wall leaks and use symmetry only with matching assumptions.
- [ ] Final weapon/sound and arena schemas in shared when a second consumer exists; keep `docs/schemas.md` and the handoff current.

## Verification/latest delivery

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.
