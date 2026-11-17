# TODO: engine

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Bot pickup-seeking next. Stair routing and cross-level engagement/cover (`EngageDirection`, `NearestCover`, `WalkingDistanceTo`; commit `4d058dc`) are merged: extend them, do not restart. The reticle worktree checkpoint is in [worktree checkpoints](docs/history/2026-11-17-worktree-checkpoints.md).

Current milestone: M1–M3; the project remains on M1. Next failing test/check: an acceptance case for the bot walking to a pickup, with engine unit cases for each rule, watched red and mutation-proved.

## Ownership

engine/ rules, combat event production, deterministic rating/balancing, arena validators and engine-owned shared vocabulary; matching acceptance scenarios.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

play needs damage/hit events and inventory data. AI owns inferred preferences; engine owns their deterministic application. Coordinate with play before editing shared files.

## Current milestone tasks

- [ ] Agree and implement local damageTaken/hitLanded events and inventory data needed by play, test-first; preserve per-tick clearing and visible-target privacy. **Foundation exists (2026-11-17, committed `8acad87`):** `engine/src/combat-events/` (`EventsOfStep({playerTurn})` returns `readonly CombatEvent[] | undefined`; `World.events` holds one step's events and every `step` return sets it, the frozen branch to `undefined`; `types/CombatEvent` is a union, today `FireRefusedEvent`). To add: `DamageTakenEvent {kind: "damageTaken", cause: "bullet" | "ring", amount}` (in `Step.ts` the bullet and ring damage are summed into `hurt(...)`, so keep the two apart first; the amount is what the health actually lost, so a hit on a fighter with 3 health says 3) and `HitLandedEvent {on: "opponent" | "dummy"}` only for targets in `visibleToPlayer(world)` at the time of the hit (a hidden target emits nothing; `AdvanceBullets`/`BulletFlight` currently report only the damage sums, not which target was hit). Extend `EventsRequest` (add fields, never the opponent's turn: the guarantee that nothing about the opponent leaves is structural) and unit-test each side, with `StepEvents.test.ts` for the step. Ring onset is the webapp's to coalesce (one cue per exposure) from `damageTaken` events whose cause is `ring`, which arrive every step the fighter is outside. Agree the event shapes in `HANDOFF.md` first (its contract row is written for the next slices); play consumes them.

- [x] Cross-level engagement and cover (2026-11-17, `4d058dc`): the bot fights from where it is, closes in by `RouteWaypoint`, and takes cover by the walk there; `?scenario=overlook` and `TheOpponentComingDownFromThePlatform` cover it. **Not done:** a bot that climbs further from a stair, a levelled best-of-three, and `ShootingAcrossLevels` ("Failed to see the dummy at 4.5, 3.5 lose health") flakes 4 to 5 of 20 repeats in isolation under load, on old main (`82ed0df`) as well as now: an open flake to fix.
- [ ] Bot pickup-seeking. Terraced fixture, stair routes, flank validation, ring-climbing and the overlook browser coverage are merged; extend their tests.
- [ ] Merge duplicated pickup/ring route-distance logic after the stairs session's route code lands. Close stair-flank access and validate routes to high ground/ring escape.
- [ ] Implement symmetrical arena finalisation/validation from [the fairness handover](docs/art/arena-fairness-research.md): matching spawn pairs, transformed stairs/heights, clearance and built-in quality. Preserve random weapon placement and the user's unchanged random ring centres; escape measurements are diagnostics, not centre filters.
- [ ] Extend visibility fixtures as mechanics land: weapon/stance changes, cone edges/full turns, wall/height occlusion, dim terrain versus revealed entities. Multiplayer must exclude hidden entities and effects from snapshots.
- [ ] Hitscan and additional weapon behaviors, penetrable cover, full three-level play and seeded spawn placement. Extend existing implementations rather than rebuilding them.

## Later tasks

- [ ] Coordinate M2 review of engine-owned weapon/arena schemas with real consumers. AI owns adapter outcomes, budget owns ledger/credit config, art owns manifest, server owns wire contracts; do not implement their domains here.

- [ ] Extend and calibrate the merged initial power rating/caps/balancer with AI; preserve deliberate weakness. Do not treat initial implementation as calibrated production policy.
- [ ] Arena validity: bounds, open space, spawn/pickup reachability, wall/height limits, legal stairs and ring escape, for built-ins and generated arenas alike.
- [ ] Deterministic output moderation: text length, charset and blocklist.
- [ ] Extend the existing eight balancing property tests to arena validity, caps and directional visibility; prove no wall leaks and use symmetry only with matching assumptions.
- [ ] Final weapon/sound and arena schemas in shared when a second consumer exists; keep `docs/schemas.md` and the handoff current.

## Verification/latest delivery

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
