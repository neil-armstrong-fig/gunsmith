import {MAX_DAMAGE_PER_SECOND} from "@gunsmith/engine/weapon-balance/limits/damage-cap/MaxDamagePerSecond";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/** Whether a weapon deals no more than the most damage a second a weapon may (a bullet's damage over the seconds between shots). */
export function withinDamageCap(stats: WeaponStats): boolean {
  return stats.bulletDamage / stats.fireIntervalSeconds <= MAX_DAMAGE_PER_SECOND;
}
