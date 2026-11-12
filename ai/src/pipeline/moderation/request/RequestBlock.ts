/**
 * Wraps the player's words in the `<request>` data block the moderation prompt describes. A closing tag inside the words
 * (any spacing or case) is replaced first, so the player cannot end the block early and write instructions outside it.
 */
export function requestBlock(prompt: string): string {
  const neutralised = prompt.replace(/<\s*\/\s*request\s*>/gi, "[/request]");

  return `<request>\n${neutralised}\n</request>`;
}
