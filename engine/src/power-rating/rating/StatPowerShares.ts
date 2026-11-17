import type {StatNumbers} from "@gunsmith/engine/power-rating/types/StatNumbers";

/**
 * How much of a weapon's power rating each stat is worth. They add up to 1, so a weapon with every stat at its strongest rates 1.
 * Damage and fire rate count most because they are what kills. A tunable table, set by play.
 */
export const STAT_POWER_SHARES: StatNumbers = {
  damage: 0.25,
  fireRate: 0.25,
  bulletSpeed: 0.1,
  magazineSize: 0.15,
  reloadSpeed: 0.15,
  reserve: 0.1,
};
