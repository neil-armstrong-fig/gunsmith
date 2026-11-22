import {isFriendCode} from "@gunsmith/shared/online/friend-code/IsFriendCode";

/** The canonical code typed or pasted by the player, with separators removed and letters uppercased. */
export function friendCodeOfText(text: string): string | undefined {
  const code = text.replace(/[\s-]/g, "").toUpperCase();
  if (!isFriendCode(code)) return undefined;

  return code;
}
