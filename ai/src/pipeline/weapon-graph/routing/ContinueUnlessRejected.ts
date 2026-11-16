import {END} from "@langchain/langgraph";
import type {WeaponGraphRoute} from "@gunsmith/ai/pipeline/weapon-graph/routing/types/WeaponGraphRoute";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/** The way on from a screening node: to the next node, or straight to the end if the request has been turned away. */
export function continueUnlessRejected(nextNode: string): WeaponGraphRoute {
  return function route(state: WeaponGraphStateValues): string {
    if (state.rejectionReason !== undefined) {
      return END;
    }

    return nextNode;
  };
}
