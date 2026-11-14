import {dataBlock} from "@gunsmith/ai/pipeline/blocks/DataBlock";

/** Wraps the player's words in the `<request>` data block the prompts describe, a closing tag inside them neutralised. */
export function requestBlock(prompt: string): string {
  return dataBlock("request", prompt);
}
