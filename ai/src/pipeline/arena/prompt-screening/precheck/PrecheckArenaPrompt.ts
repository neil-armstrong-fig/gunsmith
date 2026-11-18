import {ARENA_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/arena/prompt-screening/precheck/limit/ArenaPromptTokenLimit";
import {tokenPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/TokenPrecheck";
import type {PrecheckResult} from "@gunsmith/ai/pipeline/prompt-screening/precheck/types/PrecheckResult";

/**
 * Whether an arena prompt is worth a model call: not empty, and within the arena's token limit. Runs before any model is called, so a
 * refusal costs nothing. The arena pipeline's `precheck` node and the arena judge's screen both ask it, so the words an empty prompt
 * is told are said once.
 */
export function precheckArenaPrompt(prompt: string): PrecheckResult {
  return tokenPrecheck(prompt, ARENA_PROMPT_TOKEN_LIMIT, "Describe the arena you want.");
}
