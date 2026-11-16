import {tokenPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/TokenPrecheck";
import {WEAPON_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/prompt-screening/precheck/limit/WeaponPromptTokenLimit";
import type {
  WeaponGraphStateValues,
  WeaponGraphUpdate,
} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/** The first node: turns away a request that is empty or too long, before any model is called, so a refusal here costs nothing. */
export function precheckNode(state: WeaponGraphStateValues): WeaponGraphUpdate {
  const precheck = tokenPrecheck(state.prompt, WEAPON_PROMPT_TOKEN_LIMIT);
  if (!precheck.accepted) {
    return {nodes: ["precheck"], rejectionReason: precheck.reason};
  }

  return {nodes: ["precheck"]};
}
