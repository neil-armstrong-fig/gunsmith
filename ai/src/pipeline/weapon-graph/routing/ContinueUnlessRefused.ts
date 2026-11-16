import {END} from "@langchain/langgraph";
import type {WeaponGraphRoute} from "@gunsmith/ai/pipeline/weapon-graph/routing/types/WeaponGraphRoute";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/**
 * The way on from a check: to the next node if the check passed; to the one repair if it refused the draft and the repair is
 * still to spend; and to the end if it refused a repaired draft, so a draft is repaired once and never twice.
 */
export function continueUnlessRefused(nextNode: string): WeaponGraphRoute {
  return function route(state: WeaponGraphStateValues): string {
    if (state.errors.length === 0) {
      return nextNode;
    }

    if (state.repaired) {
      return END;
    }

    return "repair";
  };
}
