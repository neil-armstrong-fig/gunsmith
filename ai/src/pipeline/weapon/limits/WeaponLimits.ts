/**
 * The floor and cap of every weapon field. The schema is built from this table and the generation prompt quotes it, so the
 * rule the model is told and the rule the code enforces cannot drift apart. DRAFT, local to `ai/` until `build` freezes the
 * real contract in `HANDOFF.md`; every number is a tunable, set by play.
 */
export const WEAPON_LIMITS = {
  nameLength: {min: 2, max: 24},
  bulletDamage: {min: 1, max: 100},
  fireIntervalSeconds: {min: 0.05, max: 2},
  bulletSpeed: {min: 5, max: 60},
  magazineSize: {min: 1, max: 60},
  reloadSeconds: {min: 0.5, max: 5},
  startingReserve: {min: 0, max: 200},
} as const;
