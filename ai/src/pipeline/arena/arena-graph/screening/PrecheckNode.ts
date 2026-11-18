import {precheckArenaPrompt} from "@gunsmith/ai/pipeline/arena/prompt-screening/precheck/PrecheckArenaPrompt";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphUpdate";

/** The first node: turns away a request that is empty or too long, before any model is called, so a refusal here costs nothing. */
export function precheckNode(state: ArenaGraphStateValues): ArenaGraphUpdate {
  const precheck = precheckArenaPrompt(state.prompt);
  if (!precheck.accepted) {
    return {nodes: ["precheck"], rejectionReason: precheck.reason};
  }

  return {nodes: ["precheck"]};
}
