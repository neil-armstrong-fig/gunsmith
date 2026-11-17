import {validateWeaponDraft} from "@gunsmith/ai/pipeline/check/validate/ValidateWeaponDraft";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphUpdate";

/**
 * The first place the model's answer is trusted as a weapon: zod only. A draft that parses is kept, with the player's preference
 * apart from the weapon, and the last refusal is cleared; one that does not is refused with a sentence for each fault.
 */
export function validateNode(state: WeaponGraphStateValues): WeaponGraphUpdate {
  const validation = validateWeaponDraft(state.draft);
  if (!validation.ok) {
    return {errors: validation.errors, nodes: ["validate"]};
  }

  return {
    candidate: {weapon: validation.weapon, preference: validation.preference},
    errors: [],
    nodes: ["validate"],
  };
}
