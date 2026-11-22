import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";
import type {StatNumbers} from "@gunsmith/engine/power-rating/types/StatNumbers";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/**
 * How good each stat of a weapon is, from 0 (its weakest allowed value) to 1 (its strongest), so eight numbers in eight units can be
 * added up. Damage, fire rate, magazine and reload speed are judged by how many times over they are (a magazine of 12 against 6
 * is as big a step as 6 against 3), bullet speed, reserve and the two vision numbers in plain steps. The interval between shots and the reload turn round
 * into shots and reloads a second, so that higher is always better. A number past its range counts as the end of the range.
 */
export function goodnessOf(stats: WeaponStats): StatNumbers {
  const {bulletDamage, fireIntervalSeconds, bulletSpeed, magazineSize, reloadSeconds, startingReserve} = STAT_RANGES;
  const {visionDegrees, visionRange} = STAT_RANGES;

  return {
    damage: logGoodness(stats.bulletDamage, bulletDamage.min, bulletDamage.max),
    fireRate: logGoodness(1 / stats.fireIntervalSeconds, 1 / fireIntervalSeconds.max, 1 / fireIntervalSeconds.min),
    bulletSpeed: linearGoodness(stats.bulletSpeed, bulletSpeed.min, bulletSpeed.max),
    magazineSize: logGoodness(stats.magazineSize, magazineSize.min, magazineSize.max),
    reloadSpeed: logGoodness(1 / stats.reloadSeconds, 1 / reloadSeconds.max, 1 / reloadSeconds.min),
    reserve: linearGoodness(stats.startingReserve, startingReserve.min, startingReserve.max),
    visionCone: linearGoodness(stats.visionDegrees, visionDegrees.min, visionDegrees.max),
    visionRange: linearGoodness(stats.visionRange, visionRange.min, visionRange.max),
  };
}

function logGoodness(value: number, weakest: number, strongest: number): number {
  if (!(value > weakest)) {
    return 0;
  }

  if (value >= strongest) {
    return 1;
  }

  return Math.log(value / weakest) / Math.log(strongest / weakest);
}

function linearGoodness(value: number, weakest: number, strongest: number): number {
  if (!(value > weakest)) {
    return 0;
  }

  if (value >= strongest) {
    return 1;
  }

  return (value - weakest) / (strongest - weakest);
}
