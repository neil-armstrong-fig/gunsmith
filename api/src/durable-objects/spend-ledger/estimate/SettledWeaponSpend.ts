import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/WeaponSpend";

/**
 * What a finished weapon request is settled at: the model calls it made, each at the estimated price of a call. `WeaponOutcome` reports
 * the calls but not the tokens (only the drawing's `usage` is reported), so this is an estimate until `ai` sums the real usage.
 */
export function settledWeaponSpend(outcome: WeaponOutcome): number {
  return outcome.modelCalls * WEAPON_SPEND.perCallMicrodollars;
}
