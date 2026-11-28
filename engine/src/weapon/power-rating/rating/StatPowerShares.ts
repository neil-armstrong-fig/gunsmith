import type {StatNumbers} from "@gunsmith/engine/weapon/power-rating/types/StatNumbers";

/**
 * How much of a weapon's power rating each stat is worth. They add up to 1, so a weapon with every stat at its strongest rates 1.
 * Damage and fire rate count most because they are what kills. Vision is two stats, the cone and the range, so a weapon can be
 * built around either; the range is worth twice the cone because it also limits where a player can shoot. A tunable table, set by
 * play.
 */
export const STAT_POWER_SHARES: StatNumbers = {
  damage: 0.21,
  fireRate: 0.21,
  bulletSpeed: 0.09,
  magazineSize: 0.13,
  reloadSpeed: 0.13,
  reserve: 0.08,
  visionCone: 0.05,
  visionRange: 0.1,
};
