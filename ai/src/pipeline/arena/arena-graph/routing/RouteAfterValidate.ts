import {END} from "@langchain/langgraph";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";

/**
 * The way on from `validate`: to the end if the draft passed (the arena is made); to the one repair if it was refused and the repair
 * is still to spend; and to the end again if it refused a repaired draft, so a draft is repaired once and never twice, and nothing is
 * given in its place: the outcome tells the player why (the user, 2026-11-21).
 */
export function routeAfterValidate(state: ArenaGraphStateValues): string {
  if (state.errors.length === 0) {
    return END;
  }

  if (state.repaired) {
    return END;
  }

  return "repair";
}
