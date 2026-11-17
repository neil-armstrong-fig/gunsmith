import type {PrecheckResult} from "@gunsmith/ai/pipeline/prompt-screening/precheck/types/PrecheckResult";

/**
 * About four characters to a token in English: a cheap, conservative estimate that needs no tokenizer (and so no dependency in
 * the Worker). Close enough for a length limit; real token counts come from the provider's usage report afterwards.
 */
const CHARACTERS_PER_TOKEN = 4;

/**
 * Whether a prompt is worth a model call. Runs before any model is called, so a rejection here costs nothing. `emptyReason` is what
 * an empty prompt is told, because it names what the player was to describe (a weapon, an arena).
 */
export function tokenPrecheck(prompt: string, maxTokens: number, emptyReason: string): PrecheckResult {
  if (prompt.trim().length === 0) {
    return {accepted: false, reason: emptyReason};
  }

  const estimatedTokens = Math.ceil(prompt.length / CHARACTERS_PER_TOKEN);
  if (estimatedTokens > maxTokens) {
    return {
      accepted: false,
      reason: `That is too long: about ${estimatedTokens} tokens, and the limit is ${maxTokens}. Shorten it.`,
    };
  }

  return {accepted: true};
}
