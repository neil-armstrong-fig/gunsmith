import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

/**
 * What a player is told of an arena request: the outcome without the pipeline's own bookkeeping (`nodes`, `modelCalls`, `refunded`).
 * `builtIn` still carries an arena (a built-in one, the credit given back), and `rejected` carries none.
 */
export interface ArenaAnswer {
  status: ArenaOutcomeStatus;
  arena?: unknown;
  reason?: string;
}
