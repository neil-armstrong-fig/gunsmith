import {balanceWeaponDraft} from "@gunsmith/ai/pipeline/check/balance/BalanceWeaponDraft";
import type {WeaponCheck} from "@gunsmith/ai/pipeline/check/types/WeaponCheck";
import {rateWeaponDraft} from "@gunsmith/ai/pipeline/check/rate/RateWeaponDraft";
import {validateWeaponDraft} from "@gunsmith/ai/pipeline/check/validate/ValidateWeaponDraft";

/**
 * Everything code decides about what the model wrote, in order: does it parse (`validate`), then bring it inside the limits by the
 * player's preference (`balance`), then check that it is (`rate`, the backstop: `balance` leaves nothing for it to refuse). Stops at
 * the first node that refuses, and says which nodes ran, so the outcome can show the path. No model is called.
 */
export function checkWeaponDraft(candidate: unknown): WeaponCheck {
  const validation = validateWeaponDraft(candidate);
  if (!validation.ok) {
    return {ok: false, errors: validation.errors, nodes: ["validate"]};
  }

  const balanced = balanceWeaponDraft(validation.weapon, validation.preference);
  const rating = rateWeaponDraft(balanced);
  if (!rating.ok) {
    return {ok: false, errors: rating.errors, nodes: ["validate", "balance", "rate"]};
  }

  return {ok: true, weapon: balanced, nodes: ["validate", "balance", "rate"]};
}
