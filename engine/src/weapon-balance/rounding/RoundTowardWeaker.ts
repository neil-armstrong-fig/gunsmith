import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";
import type {StatRange} from "@gunsmith/engine/power-rating/types/StatRange";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/**
 * Tidies a weapon's numbers for a player to read: two decimal places, whole rounds in the magazine and the reserve, always toward
 * the weaker value (down for damage, speed and rounds, up for the interval and the reload), so rounding can never put a weapon back
 * over a limit it was trimmed to. Every number is kept inside its range.
 */
export function roundTowardWeaker(stats: WeaponStats): WeaponStats {
  return {
    bulletDamage: within(Math.floor(stats.bulletDamage * 100) / 100, STAT_RANGES.bulletDamage),
    fireIntervalSeconds: within(Math.ceil(stats.fireIntervalSeconds * 100) / 100, STAT_RANGES.fireIntervalSeconds),
    bulletSpeed: within(Math.floor(stats.bulletSpeed * 100) / 100, STAT_RANGES.bulletSpeed),
    magazineSize: within(Math.floor(stats.magazineSize), STAT_RANGES.magazineSize),
    reloadSeconds: within(Math.ceil(stats.reloadSeconds * 100) / 100, STAT_RANGES.reloadSeconds),
    startingReserve: within(Math.floor(stats.startingReserve), STAT_RANGES.startingReserve),
  };
}

function within(value: number, range: StatRange): number {
  return Math.min(range.max, Math.max(range.min, value));
}
