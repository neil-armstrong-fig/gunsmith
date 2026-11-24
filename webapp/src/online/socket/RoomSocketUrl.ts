import {apiOriginOfPage} from "@src/online/api-origin/ApiOriginOfPage";
import type {PageAddress} from "@src/online/types/PageAddress";
import type {SocketAsk} from "@src/online/socket/types/SocketAsk";

/**
 * The page's query fields that are passed on to the room (`api/` reads them from its first connection): how long it waits for a person
 * (`parseForfeitLimits`), how long the two seats have to choose (`parsePreRoundSeconds`), the seed its rounds start from (`parseStartSeed`)
 * and how its ring runs (`parseRingTiming`). Tuning seams, like `?lag=`.
 */
const PASSED_ON = [
  "reconnectSeconds",
  "idleSeconds",
  "preRoundSeconds",
  "revealSeconds",
  "startSeed",
  "ringDelay",
  "ringClosing",
];

/**
 * The deployed webapp connects directly to the API Worker. Local pages use Vite's WebSocket proxy. `ask.token` is the secret the room gave this browser's seat, shown to get the seat back; `ask.search` is
 * the page's own query, of which only the limits a spec may shorten and the start seed are passed on.
 */
export function roomSocketUrl(page: PageAddress, code: string, ask: SocketAsk = {}): string {
  const address = `${socketOrigin(page)}/api/rooms/${encodeURIComponent(code)}/socket`;
  const fields = [...tokenField(ask.token), ...limitFields(ask.search)];
  if (fields.length === 0) {
    return address;
  }

  return `${address}?${fields.join("&")}`;
}

function socketOrigin(page: PageAddress): string {
  if (page.protocol === "https:") {
    return apiOriginOfPage(page, "wss:");
  }

  return apiOriginOfPage(page, "ws:");
}

function tokenField(token: string | undefined): string[] {
  if (!token) {
    return [];
  }

  return [`token=${encodeURIComponent(token)}`];
}

function limitFields(search: string | undefined): string[] {
  const query = new URLSearchParams(search ?? "");
  const fields: string[] = [];
  for (const name of PASSED_ON) {
    const value = query.get(name);
    if (value) {
      fields.push(`${name}=${encodeURIComponent(value)}`);
    }
  }

  return fields;
}
