import {tokenPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/TokenPrecheck";
import {ARENA_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/arena/prompt-screening/precheck/limit/ArenaPromptTokenLimit";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphUpdate";

/** The first node: turns away a request that is empty or too long, before any model is called, so a refusal here costs nothing. */
export function precheckNode(state: ArenaGraphStateValues): ArenaGraphUpdate {
  const precheck = tokenPrecheck(state.prompt, ARENA_PROMPT_TOKEN_LIMIT, "Describe the arena you want.");
  if (!precheck.accepted) {
    return {nodes: ["precheck"], rejectionReason: precheck.reason};
  }

  return {nodes: ["precheck"]};
}
