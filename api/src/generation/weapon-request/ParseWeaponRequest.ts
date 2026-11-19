const MAX_PROMPT_LENGTH = 2000;

/**
 * The words a player typed, from the body of a weapon request, or `undefined` when the body is not `{prompt}` with some text in it.
 * Everything a client sends is `unknown` until here. The prompt is returned exactly as typed: it is data for the pipeline, which screens
 * it, never something to tidy here. The length bound is only a cap on what reaches the pipeline (the pipeline's own pre-check turns
 * away a prompt over its token limit at half price, which a prompt this short can still reach).
 */
export function parseWeaponRequest(text: string): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return undefined;
  }

  const prompt: unknown = Reflect.get(parsed, "prompt");
  if (typeof prompt !== "string" || prompt.trim() === "" || prompt.length > MAX_PROMPT_LENGTH) {
    return undefined;
  }

  return prompt;
}
