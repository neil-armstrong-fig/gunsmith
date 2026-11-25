import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

/**
 * What a player is told of an arena request: the outcome without the pipeline's own bookkeeping (`nodes`, `modelCalls`, `refunded`).
 * `invalid` and `rejected` carry a reason and no arena: nothing is given in the place of an arena that could not be made.
 */
export interface ArenaAnswer {
  status: ArenaOutcomeStatus;
  /** The id a created result is kept under: what the page sends to put it on the library shelf. Absent when nothing was kept. */
  id?: string;
  arena?: unknown;
  reason?: string;
}
