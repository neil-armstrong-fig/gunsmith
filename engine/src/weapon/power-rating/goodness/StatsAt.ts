import {STAT_RANGES} from "@gunsmith/engine/weapon/power-rating/ranges/StatRanges";
import type {StatNumbers} from "@gunsmith/engine/weapon/power-rating/types/StatNumbers";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/** The weapon that has the given goodness in every stat: `goodnessOf` run backwards. A goodness of 0 is a stat's weakest value and 1 its strongest. */
export function statsAt(goodness: StatNumbers): WeaponStats {
  const {bulletDamage, fireIntervalSeconds, bulletSpeed, magazineSize, reloadSeconds, startingReserve} = STAT_RANGES;
  const {visionDegrees, visionRange} = STAT_RANGES;

  return {
    bulletDamage: logValue(goodness.damage, bulletDamage.min, bulletDamage.max),
    fireIntervalSeconds: 1 / logValue(goodness.fireRate, 1 / fireIntervalSeconds.max, 1 / fireIntervalSeconds.min),
    bulletSpeed: linearValue(goodness.bulletSpeed, bulletSpeed.min, bulletSpeed.max),
    magazineSize: logValue(goodness.magazineSize, magazineSize.min, magazineSize.max),
    reloadSeconds: 1 / logValue(goodness.reloadSpeed, 1 / reloadSeconds.max, 1 / reloadSeconds.min),
    startingReserve: linearValue(goodness.reserve, startingReserve.min, startingReserve.max),
    visionDegrees: linearValue(goodness.visionCone, visionDegrees.min, visionDegrees.max),
    visionRange: linearValue(goodness.visionRange, visionRange.min, visionRange.max),
  };
}

function logValue(goodness: number, weakest: number, strongest: number): number {
  return weakest * (strongest / weakest) ** goodness;
}

function linearValue(goodness: number, weakest: number, strongest: number): number {
  return weakest + goodness * (strongest - weakest);
}
