/**
 * The stats a player can ask for more or less of, one for each number a weapon plays with. `fireRate` is `fireIntervalSeconds`
 * turned round (shots a second) and `reloadSpeed` is `reloadSeconds` turned round, so that for every stat higher is stronger.
 */
export const STAT_NAMES = ["damage", "fireRate", "bulletSpeed", "magazineSize", "reloadSpeed", "reserve"] as const;

export type StatName = (typeof STAT_NAMES)[number];
