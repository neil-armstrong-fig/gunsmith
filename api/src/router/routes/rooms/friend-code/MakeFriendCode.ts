import {FRIEND_CODE_FORMAT} from "@gunsmith/shared/online/friend-code/format/FriendCodeFormat";

/** A new friend code for a private room, drawn with the runtime's cryptographic randomness: it is the only thing that lets a stranger in. */
export function makeFriendCode(): string {
  const {alphabet, length} = FRIEND_CODE_FORMAT;
  const draws = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(draws, draw => alphabet.charAt(draw % alphabet.length)).join("");
}
