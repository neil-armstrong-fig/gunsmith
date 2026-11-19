import type {PromptReadout} from "@src/react/components/dom/workshop/components/weapon-prompt/readout/types/PromptReadout";
import {WEAPON_PROMPT_LIMIT} from "@src/react/components/dom/workshop/components/weapon-prompt/readout/WeaponPromptLimit";

/** The count and the verdict for a weapon prompt. Characters are counted as the pre-check counts them, so the box and the backstop agree. */
export function promptReadoutOf(prompt: string): PromptReadout {
  const over = prompt.length > WEAPON_PROMPT_LIMIT;

  return {
    length: prompt.length,
    limit: WEAPON_PROMPT_LIMIT,
    over,
    canMake: prompt.trim().length > 0 && !over,
  };
}
