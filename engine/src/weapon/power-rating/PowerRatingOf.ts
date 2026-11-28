import {goodnessOf} from "@gunsmith/engine/weapon/power-rating/goodness/GoodnessOf";
import {STAT_POWER_SHARES} from "@gunsmith/engine/weapon/power-rating/rating/StatPowerShares";
import {STAT_NAMES} from "@gunsmith/engine/weapon/power-rating/types/StatName";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/**
 * How strong a weapon is overall, from 0 (every stat at its weakest) to 1 (every stat at its strongest): each stat's goodness,
 * weighted by what the stat is worth (`STAT_POWER_SHARES`), added up. One number for six, so a weapon cannot be strong everywhere.
 */
export function powerRatingOf(stats: WeaponStats): number {
  const goodness = goodnessOf(stats);
  let rating = 0;

  for (const stat of STAT_NAMES) {
    rating += STAT_POWER_SHARES[stat] * goodness[stat];
  }

  return rating;
}
