import {FRIEND_CODE_ALPHABET} from "@src/router/routes/shared/friend-code/FriendCodeAlphabet";

const FRIEND_CODE_LENGTH = 6;

/** A new friend code for a private room, drawn with the runtime's cryptographic randomness: it is the only thing that lets a stranger in. */
export function makeFriendCode(): string {
  const draws = crypto.getRandomValues(new Uint8Array(FRIEND_CODE_LENGTH));

  return Array.from(draws, draw => FRIEND_CODE_ALPHABET.charAt(draw % FRIEND_CODE_ALPHABET.length)).join("");
}
