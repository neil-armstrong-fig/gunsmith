import type {WeaponCheck} from "@gunsmith/ai/pipeline/check/types/WeaponCheck";
import {rateWeaponDraft} from "@gunsmith/ai/pipeline/check/rate/RateWeaponDraft";
import {validateWeaponDraft} from "@gunsmith/ai/pipeline/check/validate/ValidateWeaponDraft";

/**
 * Everything code decides about what the model wrote, in order: does it parse (`validate`), then is it within the cap (`rate`).
 * Stops at the first node that refuses, and says which nodes ran, so the outcome can show the path. No model is called.
 */
export function checkWeaponDraft(candidate: unknown): WeaponCheck {
  const validation = validateWeaponDraft(candidate);
  if (!validation.ok) {
    return {ok: false, errors: validation.errors, nodes: ["validate"]};
  }

  const rating = rateWeaponDraft(validation.weapon);
  if (!rating.ok) {
    return {ok: false, errors: rating.errors, nodes: ["validate", "rate"]};
  }

  return {ok: true, weapon: validation.weapon, nodes: ["validate", "rate"]};
}
