import type {PageAddress} from "@src/online/socket/types/PageAddress";

/** The address of a room's WebSocket on the page's own origin: `wss` on a secure page, `ws` otherwise. The Worker serving the site serves `/api/*`, so there is no other host. */
export function roomSocketUrl(page: PageAddress, code: string): string {
  const scheme = page.protocol === "https:" ? "wss" : "ws";

  return `${scheme}://${page.host}/api/rooms/${encodeURIComponent(code)}/socket`;
}
