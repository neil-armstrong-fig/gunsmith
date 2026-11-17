import {FRIEND_CODE_ALPHABET} from "@src/rooms/FriendCodeAlphabet";

/** Whether `text` has the shape of a friend code: six letters and digits from the alphabet. It does not say a room exists. */
export function isFriendCode(text: string): boolean {
  return text.length === 6 && [...text].every(character => FRIEND_CODE_ALPHABET.includes(character));
}
