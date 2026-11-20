import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/** What a player is told when the arena they asked for could not be built and one of ours is given instead. */
const BUILT_IN_REASON = "We could not build a playable arena from that request, so here is one of ours.";

/**
 * Reads how the run ended off the state it ended in: turned away (a reason was set), made (an arena passed every check), or given
 * a built-in arena because none did, even after the one repair. Only a request turned away before any model call is refunded
 * (the user's rule, 2026-11-20: a request that reached the model was paid for, even when its arena was not usable). An arena left in the state by a first try
 * that was then refused is never handed on, because `validate` only sets one for a draft that passed. Throws if the run ended any
 * other way, which can only be a mistake in the graph.
 */
export function arenaOutcomeFromState(state: ArenaGraphStateValues): ArenaOutcome {
  if (state.rejectionReason !== undefined) {
    return {
      status: "rejected",
      reason: state.rejectionReason,
      refunded: state.modelCalls === 0,
      nodes: state.nodes,
      modelCalls: state.modelCalls,
    };
  }

  if (state.builtIn !== undefined) {
    return {
      status: "builtIn",
      arena: state.builtIn,
      reason: BUILT_IN_REASON,
      refunded: false,
      nodes: state.nodes,
      modelCalls: state.modelCalls,
    };
  }

  if (state.arena !== undefined && state.errors.length === 0) {
    return {status: "created", arena: state.arena, refunded: false, nodes: state.nodes, modelCalls: state.modelCalls};
  }

  throw new Error("The arena graph ended with no arena, no built-in arena and no rejection.");
}
