import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/** Every number at its strongest allowed value, written out so a test does not depend on the table it checks. For tests only. */
export const STRONGEST_STATS: WeaponStats = {
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
};
