import type {PageAddress} from "@src/online/socket/types/PageAddress";
import type {SocketAsk} from "@src/online/socket/types/SocketAsk";

/**
 * The page's query fields that are passed on to the room (`api/` reads them from its first connection): how long it waits for a person
 * (`parseForfeitLimits`) and the seed its rounds start from (`parseStartSeed`). Tuning seams, like `?lag=`.
 */
const PASSED_ON = ["reconnectSeconds", "idleSeconds", "startSeed"];

/**
 * The address of a room's WebSocket on the page's own origin: `wss` on a secure page, `ws` otherwise. The Worker serving the site serves
 * `/api/*`, so there is no other host. `ask.token` is the secret the room gave this browser's seat, shown to get the seat back; `ask.search` is
 * the page's own query, of which only the limits a spec may shorten and the start seed are passed on.
 */
export function roomSocketUrl(page: PageAddress, code: string, ask: SocketAsk = {}): string {
  const scheme = page.protocol === "https:" ? "wss" : "ws";
  const address = `${scheme}://${page.host}/api/rooms/${encodeURIComponent(code)}/socket`;
  const fields = [...tokenField(ask.token), ...limitFields(ask.search)];
  if (fields.length === 0) {
    return address;
  }

  return `${address}?${fields.join("&")}`;
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
