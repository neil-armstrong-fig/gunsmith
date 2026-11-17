# Schemas and contracts

Code is the source of truth. Current contracts are smaller than the intended game vocabulary; future fields below are proposals, not existing wire APIs. Move a shape into `shared/` only when a second package actually imports it, with consumer review in [HANDOFF.md](../HANDOFF.md).

## Current weapon data

`ai/src/pipeline/weapon/WeaponDraft.ts` defines a strict draft schema with `name`, `bulletDamage`, `fireIntervalSeconds`, `bulletSpeed`, `magazineSize`, `reloadSeconds`, and `startingReserve`. Model replies first pass the loose proposal parser, then code clamps ranges and invokes the engine balancer before the strict backstop.

`engine/src/weapon/types/Weapon.ts` holds those gameplay numbers plus `visionDegrees` and `visionRange`. AI/engine reconciliation of generated vision is pending; do not invent free vision values in research or claim the AI draft already contains them.

The engine owns stat ranges, rating and power budget. Balancing reduces an over-budget result while preserving preferences where possible; it does not fill unused budget. Names remain bounded plain text. Output is untrusted until parsed.

Appearance is a separate bounded primitive description, with code validation and disclosed fallback. It cannot add mechanics or change hitboxes. See [visual generation](ai-visual-generation.md).

## Current arena and snapshot data

Inspect `engine/src/arena/` and its validator/tests for the current arena types. Stairs are the only legal transitions between levels; raised stair flanks cannot bypass landings. Arena finalisation and fairness require engine-owned acceptance coverage.

`shared/src/state-hook/` is the browser acceptance snapshot contract, not the future network protocol. It is deliberately read-only. Runtime visibility is calculated by the engine; the planned server must filter outgoing snapshots as well.

## Future capabilities

Weapon behavior classes, penetration, synthesis parameters, arena generation hints, edit-from-base, library storage and network messages need real consumers and acceptance specs before schemas are frozen. No obsolete draft field table should be treated as implementation authorization.

See [game design](game-design.md), [netcode](match-netcode.md), [pipeline](ai-pipeline.md), and [ownership](../HANDOFF.md).
