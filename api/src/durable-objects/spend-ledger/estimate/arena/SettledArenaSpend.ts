import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";

const CALL_PRICES = [
  ARENA_SPEND.moderationMicrodollars,
  ARENA_SPEND.generationMicrodollars,
  ARENA_SPEND.repairMicrodollars,
];

/**
 * What a finished arena request is settled at: the model calls it made, each at the estimated price of its place (moderation, then
 * generation, then the one repair). `ArenaOutcome` reports the calls but not their tokens, so this is an estimate. A built-in arena
 * is settled too: its credit goes back, but the model was billed for the calls that failed.
 */
export function settledArenaSpend(outcome: ArenaOutcome): number {
  return CALL_PRICES.slice(0, outcome.modelCalls).reduce((total, price) => total + price, 0);
}
