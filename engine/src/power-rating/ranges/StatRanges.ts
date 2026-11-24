import type {WeaponStatRanges} from "@gunsmith/engine/power-rating/types/WeaponStatRanges";

/**
 * The floor and cap of each number a weapon plays with: the one home of them, which the AI's generation prompt quotes and its
 * schema is built from. Every number is a tunable, set by play.
 */
export const STAT_RANGES: WeaponStatRanges = {
  bulletDamage: {min: 1, max: 100},
  fireIntervalSeconds: {min: 0.05, max: 2},
  bulletSpeed: {min: 5, max: 60},
  magazineSize: {min: 1, max: 60},
  reloadSeconds: {min: 0.5, max: 5},
  startingReserve: {min: 0, max: 200},
  visionDegrees: {min: 50, max: 130},
  visionRange: {min: 6, max: 20},
};
