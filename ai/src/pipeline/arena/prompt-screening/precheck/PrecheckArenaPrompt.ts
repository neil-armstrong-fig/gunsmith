import {ARENA_PROMPT_CHARACTER_LIMIT} from "@gunsmith/ai/pipeline/arena/prompt-screening/precheck/limit/ArenaPromptCharacterLimit";
import {characterPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/CharacterPrecheck";
import type {PrecheckResult} from "@gunsmith/ai/pipeline/prompt-screening/precheck/types/PrecheckResult";

/**
 * Whether an arena prompt is worth a model call: not empty, and within the arena's character limit. Runs before any model is called, so a
 * refusal costs nothing. The arena pipeline's `precheck` node and the arena judge's screen both ask it, so the words an empty prompt
 * is told are said once.
 */
export function precheckArenaPrompt(prompt: string): PrecheckResult {
  return characterPrecheck(prompt, ARENA_PROMPT_CHARACTER_LIMIT, "Describe the arena you want.");
}
