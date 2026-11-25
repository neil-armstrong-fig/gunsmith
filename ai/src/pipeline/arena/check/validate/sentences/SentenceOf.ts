const MAX_ERROR_LENGTH = 160;

/** A refusal's sentence cut to a length the repair can be shown: some of its words came from the model, or through it from the player. */
export function sentenceOf(text: string): string {
  return text.slice(0, MAX_ERROR_LENGTH);
}
