import {isFriendCode} from "@gunsmith/shared/online/friend-code/IsFriendCode";
import {apiOriginOfPage} from "@src/online/api-origin/ApiOriginOfPage";
import type {PageAddress} from "@src/online/types/PageAddress";

/** Asks the server for a private room and answers its friend code, or nothing when the server cannot be reached, refuses or answers with no code. */
export async function makeRoom(page: PageAddress, signal?: AbortSignal): Promise<string | undefined> {
  try {
    const request: RequestInit = {method: "POST", credentials: "include"};
    if (signal) request.signal = signal;

    const response = await fetch(`${apiOriginOfPage(page)}/api/rooms`, request);
    if (!response.ok) {
      return undefined;
    }

    return codeOfAnswer(await response.json());
  } catch {
    return undefined;
  }
}

function codeOfAnswer(answer: unknown): string | undefined {
  if (typeof answer !== "object" || answer === null) {
    return undefined;
  }

  const code: unknown = Reflect.get(answer, "code");
  if (typeof code !== "string" || !isFriendCode(code)) {
    return undefined;
  }

  return code;
}
