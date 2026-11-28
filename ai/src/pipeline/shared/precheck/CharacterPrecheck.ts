import type {PrecheckResult} from "@gunsmith/ai/pipeline/shared/precheck/types/PrecheckResult";

/**
 * Whether a prompt is worth a model call. Runs before any model is called, so a rejection here costs nothing. The limit is in
 * characters, counted with `.length`, because that is what a player's text box counts and needs no tokenizer (and so no dependency in
 * the Worker); real token counts come from the provider's usage report afterwards. `emptyReason` is what an empty prompt is told,
 * because it names what the player was to describe (a weapon, an arena).
 */
export function characterPrecheck(prompt: string, maxCharacters: number, emptyReason: string): PrecheckResult {
  if (prompt.trim().length === 0) {
    return {accepted: false, reason: emptyReason};
  }

  if (prompt.length > maxCharacters) {
    return {
      accepted: false,
      reason: `That is too long: it has ${prompt.length} characters, and the limit is ${maxCharacters}. Shorten it.`,
    };
  }

  return {accepted: true};
}
