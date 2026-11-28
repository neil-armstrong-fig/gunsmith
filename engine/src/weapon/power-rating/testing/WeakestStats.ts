import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/** Every number at its weakest allowed value, written out so a test does not depend on the table it checks. For tests only. */
export const WEAKEST_STATS: WeaponStats = {
  bulletDamage: 1,
  fireIntervalSeconds: 2,
  bulletSpeed: 5,
  magazineSize: 1,
  reloadSeconds: 5,
  startingReserve: 0,
  visionDegrees: 50,
  visionRange: 6,
};
