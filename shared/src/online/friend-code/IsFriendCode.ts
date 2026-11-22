import {FRIEND_CODE_FORMAT} from "@gunsmith/shared/online/friend-code/format/FriendCodeFormat";

/** Whether `text` has the shape of a friend code: six letters and digits from the alphabet. It does not say a room exists. */
export function isFriendCode(text: string): boolean {
  const {alphabet, length} = FRIEND_CODE_FORMAT;

  return text.length === length && [...text].every(character => alphabet.includes(character));
}
