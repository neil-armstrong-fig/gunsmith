import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {tokenSpend} from "@src/durable-objects/spend-ledger/estimate/token-price/TokenSpend";

/**
 * What a finished weapon request is settled at: the tokens its models reported (`WeaponOutcome.usage`, summed over every call), priced
 * at Haiku's list price. When they reported none, the model calls it made, each at the estimated price of a call. A request that never
 * reached a model costs nothing.
 */
export function settledWeaponSpend(outcome: WeaponOutcome): number {
  if (outcome.modelCalls === 0) {
    return 0;
  }

  const fromTokens = tokenSpend(outcome.usage);
  if (fromTokens !== undefined) {
    return fromTokens;
  }

  return outcome.modelCalls * WEAPON_SPEND.perCallMicrodollars;
}
