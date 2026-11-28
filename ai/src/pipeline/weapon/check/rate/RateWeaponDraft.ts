import type {WeaponRating} from "@gunsmith/ai/pipeline/weapon/check/rate/types/WeaponRating";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import {MAX_DAMAGE_PER_SECOND} from "@gunsmith/engine/weapon-balance/limits/damage-cap/MaxDamagePerSecond";
import {POWER_BUDGET} from "@gunsmith/engine/weapon-balance/limits/power-budget/PowerBudget";
import {powerRatingOf} from "@gunsmith/engine/power-rating/PowerRatingOf";

/**
 * Judges how strong a valid weapon is against the engine's two limits, the damage it deals in a second and its power rating, and
 * refuses one over either. It never changes the weapon. It is the backstop behind `balanceWeaponDraft`, which brings a weapon inside
 * both limits before it gets here, so a refusal means the balancing was bypassed: the weapon goes back to `repair` once and
 * otherwise fails, in the open rather than by quietly clamping. The limits themselves are the engine's (`engine/src/power-rating/`).
 */
export function rateWeaponDraft(weapon: WeaponDraft): WeaponRating {
  const damagePerSecond = weapon.bulletDamage / weapon.fireIntervalSeconds;
  const powerRating = powerRatingOf(weapon);
  const errors: string[] = [];

  if (damagePerSecond > MAX_DAMAGE_PER_SECOND) {
    const shown = Math.round(damagePerSecond * 10) / 10;

    errors.push(
      `weapon: ${shown} damage per second is over the limit of ${MAX_DAMAGE_PER_SECOND}; lower bulletDamage or raise fireIntervalSeconds`,
    );
  }

  if (powerRating > POWER_BUDGET) {
    const shown = Math.round(powerRating * 100) / 100;

    errors.push(`weapon: power rating ${shown} is over the budget of ${POWER_BUDGET}; make some stats weaker`);
  }

  if (errors.length > 0) {
    return {ok: false, errors};
  }

  return {ok: true, damagePerSecond};
}
