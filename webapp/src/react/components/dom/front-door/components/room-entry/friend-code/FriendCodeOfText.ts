/** The letters and digits a friend code is made of (`api/`'s alphabet, copied: no `0`/`O` or `1`/`I`, which are read wrongly aloud). */
const FRIEND_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const FRIEND_CODE_LENGTH = 6;

/** The friend code that `text` stands for, or nothing when it is not one: spaces and hyphens are ignored and lower case is read as upper. */
export function friendCodeOfText(text: string): string | undefined {
  const code = text.replace(/[\s-]/g, "").toUpperCase();
  if (code.length !== FRIEND_CODE_LENGTH) {
    return undefined;
  }

  if (![...code].every(character => FRIEND_CODE_ALPHABET.includes(character))) {
    return undefined;
  }

  return code;
}
