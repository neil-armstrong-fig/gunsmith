import {characterPrecheck} from "@gunsmith/ai/pipeline/shared/precheck/CharacterPrecheck";
import {WEAPON_PROMPT_CHARACTER_LIMIT} from "@gunsmith/ai/pipeline/weapon/screening/precheck/limit/WeaponPromptCharacterLimit";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon/graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon/graph/state/types/WeaponGraphUpdate";

/** The first node: turns away a request that is empty or too long, before any model is called, so a refusal here costs nothing. */
export function precheckNode(state: WeaponGraphStateValues): WeaponGraphUpdate {
  const precheck = characterPrecheck(state.prompt, WEAPON_PROMPT_CHARACTER_LIMIT, "Describe the weapon you want.");
  if (!precheck.accepted) {
    return {nodes: ["precheck"], rejectionReason: precheck.reason};
  }

  return {nodes: ["precheck"]};
}
