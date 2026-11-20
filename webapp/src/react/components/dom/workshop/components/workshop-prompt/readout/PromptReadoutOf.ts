import type {PromptReadout} from "@src/react/components/dom/workshop/components/workshop-prompt/readout/types/PromptReadout";

/** Characters are counted as the pre-check counts them, so the box and the backstop agree. */
export function promptReadoutOf(prompt: string, limit: number): PromptReadout {
  const over = prompt.length > limit;

  return {
    length: prompt.length,
    limit,
    over,
    canMake: prompt.trim().length > 0 && !over,
  };
}
