// About four characters to a token in English: a cheap, conservative estimate that needs no tokenizer (and so no dependency
// in the Worker). Close enough for a length limit; real token counts come from the provider's usage report afterwards.
const CHARACTERS_PER_TOKEN = 4;

export type PrecheckResult = {accepted: true} | {accepted: false; reason: string};

// Runs before any model call, so a rejection here costs nothing.
export function tokenPrecheck(prompt: string, maxTokens: number): PrecheckResult {
  if (prompt.trim().length === 0) {
    return {accepted: false, reason: "Describe the weapon you want."};
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
