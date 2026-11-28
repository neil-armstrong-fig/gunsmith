import {END} from "@langchain/langgraph";
import type {ArenaGraphRoute} from "@gunsmith/ai/pipeline/arena/graph/routing/types/ArenaGraphRoute";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/graph/state/types/ArenaGraphStateValues";

/** The way on from a screening node: to the next node, or straight to the end if the request has been turned away. */
export function continueUnlessRejected(nextNode: string): ArenaGraphRoute {
  return function route(state: ArenaGraphStateValues): string {
    if (state.rejectionReason !== undefined) {
      return END;
    }

    return nextNode;
  };
}
