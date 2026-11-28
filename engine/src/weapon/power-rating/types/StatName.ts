/**
 * The stats a player can ask for more or less of, one for each number a weapon plays with. `fireRate` is `fireIntervalSeconds`
 * turned round (shots a second) and `reloadSpeed` is `reloadSeconds` turned round, so that for every stat higher is stronger.
 * `visionCone` is `visionDegrees` (how wide the holder sees) and `visionRange` is how far, which also limits where they can shoot.
 */
export const STAT_NAMES = [
  "damage",
  "fireRate",
  "bulletSpeed",
  "magazineSize",
  "reloadSpeed",
  "reserve",
  "visionCone",
  "visionRange",
] as const;

export type StatName = (typeof STAT_NAMES)[number];
