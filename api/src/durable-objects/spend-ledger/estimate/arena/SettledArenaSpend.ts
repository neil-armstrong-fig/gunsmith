import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {pricedUsage} from "@src/durable-objects/spend-ledger/estimate/tokens/PricedUsage";

const CALL_PRICES = [
  ARENA_SPEND.moderationMicrodollars,
  ARENA_SPEND.generationMicrodollars,
  ARENA_SPEND.repairMicrodollars,
];

/**
 * What a finished arena request is settled at: the tokens its models reported (`outcome.usage`, summed over every call), priced at
 * Haiku's rates. A request that reported none is settled at the model calls it made, each at the estimated price of its place
 * (moderation, then generation, then the one repair). A built-in arena is settled too: its credit goes back, but the model was billed
 * for the calls that failed.
 */
export function settledArenaSpend(outcome: ArenaOutcome): number {
  const reported = pricedUsage(outcome.usage);
  if (reported !== undefined) {
    return reported;
  }

  return CALL_PRICES.slice(0, outcome.modelCalls).reduce((total, price) => total + price, 0);
}
