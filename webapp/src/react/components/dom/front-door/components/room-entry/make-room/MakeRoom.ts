import {apiOriginOfPage} from "@src/react/components/dom/front-door/components/room-entry/make-room/api-origin/ApiOriginOfPage";
import type {PageAddress} from "@src/online/socket/types/PageAddress";

/** Asks the server for a private room and answers its friend code, or nothing when the server cannot be reached, refuses or answers with no code. */
export async function makeRoom(page: PageAddress): Promise<string | undefined> {
  try {
    const response = await fetch(`${apiOriginOfPage(page)}/api/rooms`, {method: "POST", credentials: "include"});
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
  if (typeof code !== "string") {
    return undefined;
  }

  return code;
}
