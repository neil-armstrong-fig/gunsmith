import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import {pricedUsage} from "@src/durable-objects/spend-ledger/estimate/tokens/PricedUsage";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";

/**
 * What a finished weapon request is settled at: the tokens its models reported (`outcome.usage`, summed over every call), priced at
 * Haiku's rates. A request that reported none (a model that said nothing, or an outcome without `usage`) is settled at the model calls
 * it made, each at the estimated price of a call, since a call that reported nothing was not free.
 */
export function settledWeaponSpend(outcome: WeaponOutcome): number {
  const reported = pricedUsage(outcome.usage);
  if (reported !== undefined) {
    return reported;
  }

  return outcome.modelCalls * WEAPON_SPEND.perCallMicrodollars;
}
