import {MAX_DAMAGE_PER_SECOND} from "@gunsmith/ai/pipeline/rate/MaxDamagePerSecond";
import type {WeaponRating} from "@gunsmith/ai/pipeline/rate/types/WeaponRating";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/**
 * Judges how strong a valid weapon is, by the damage it deals in a second, and refuses one over the cap. It never changes the
 * weapon: a weapon over the cap goes back to `repair` once and otherwise fails, so the AI proposes and code disposes in the open
 * rather than by quietly clamping. The one home of the cap; `engine/`'s power rating replaces it when `build` writes that.
 */
export function rateWeaponDraft(weapon: WeaponDraft): WeaponRating {
  const damagePerSecond = weapon.bulletDamage / weapon.fireIntervalSeconds;
  if (damagePerSecond <= MAX_DAMAGE_PER_SECOND) {
    return {ok: true, damagePerSecond};
  }

  const shown = Math.round(damagePerSecond * 10) / 10;

  return {
    ok: false,
    errors: [
      `weapon: ${shown} damage per second is over the limit of ${MAX_DAMAGE_PER_SECOND}; lower bulletDamage or raise fireIntervalSeconds`,
    ],
  };
}
