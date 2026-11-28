import {reasonForInvalidArena} from "@gunsmith/ai/pipeline/arena/graph/outcome/invalid-reason/ReasonForInvalidArena";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/graph/state/types/ArenaGraphStateValues";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/**
 * Reads how the run ended off the state it ended in: turned away (a reason was set), made (an arena passed every check), or invalid
 * because none did, even after the one repair: no arena, and a reason from why the last check refused. Only a request turned away before any model call is refunded
 * (the user's rule, 2026-11-20: a request that reached the model was paid for, even when its arena was not usable). No arena is handed on
 * with an invalid outcome, whatever the state holds. Throws if the run ended any other way, which can only be a mistake in the graph.
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

  if (state.errors.length > 0) {
    return {
      status: "invalid",
      reason: reasonForInvalidArena(state.validationFailure, state.problemKinds),
      refunded: false,
      nodes: state.nodes,
      modelCalls: state.modelCalls,
    };
  }

  if (state.arena !== undefined) {
    return {status: "created", arena: state.arena, refunded: false, nodes: state.nodes, modelCalls: state.modelCalls};
  }

  throw new Error("The arena graph ended with no arena, no refusal and no rejection.");
}
