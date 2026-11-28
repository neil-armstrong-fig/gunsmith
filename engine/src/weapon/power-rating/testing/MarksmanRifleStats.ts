import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/** The engine's marksman rifle (its six stats and its vision), written out so a test does not depend on the weapon it checks. For tests only. */
export const MARKSMAN_RIFLE_STATS: WeaponStats = {
  bulletDamage: 50,
  fireIntervalSeconds: 0.6,
  bulletSpeed: 30,
  magazineSize: 5,
  reloadSeconds: 2.2,
  startingReserve: 15,
  visionDegrees: 90,
  visionRange: 16,
};
