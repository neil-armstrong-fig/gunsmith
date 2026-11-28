import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/** The engine's rifle (its six stats and its vision), written out so a test does not depend on the weapon it checks. For tests only. */
export const RIFLE_STATS: WeaponStats = {
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};
