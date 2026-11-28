/**
 * Wraps text in a named data block (`<tag>` on a line, the text, `</tag>` on a line) for a prompt that describes the block. A
 * closing tag of the same name inside the text, in any spacing or case, is replaced first, so the text cannot end the block
 * early and write instructions outside it. The tag is always one of ours, never taken from a player.
 */
export function dataBlock(tag: string, text: string): string {
  const closingTag = new RegExp(`<\\s*/\\s*${tag}\\s*>`, "gi");

  return `<${tag}>\n${text.replace(closingTag, `[/${tag}]`)}\n</${tag}>`;
}
