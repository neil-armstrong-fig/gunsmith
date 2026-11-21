import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {tokenSpend} from "@src/durable-objects/spend-ledger/estimate/token-price/TokenSpend";

const CALL_PRICES = [
  ARENA_SPEND.moderationMicrodollars,
  ARENA_SPEND.generationMicrodollars,
  ARENA_SPEND.repairMicrodollars,
];

/**
 * What a finished arena request is settled at: the tokens its models reported (`ArenaOutcome.usage`, summed over every call), priced at
 * Haiku's list price. When they reported none, the model calls it made, each at the estimated price of its place (moderation, then
 * generation, then the one repair). A built-in arena is settled too: its credit goes back, but the model was billed for the calls that
 * failed. A request that never reached a model costs nothing.
 */
export function settledArenaSpend(outcome: ArenaOutcome): number {
  if (outcome.modelCalls === 0) {
    return 0;
  }

  const fromTokens = tokenSpend(outcome.usage);
  if (fromTokens !== undefined) {
    return fromTokens;
  }

  return CALL_PRICES.slice(0, outcome.modelCalls).reduce((total, price) => total + price, 0);
}
