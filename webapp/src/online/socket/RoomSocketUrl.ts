import type {PageAddress} from "@src/online/socket/types/PageAddress";

/**
 * The address of a room's WebSocket on the page's own origin: `wss` on a secure page, `ws` otherwise. The Worker serving the site serves
 * `/api/*`, so there is no other host. `token` is the secret the room gave this browser's seat, shown to get the seat back.
 */
export function roomSocketUrl(page: PageAddress, code: string, token?: string): string {
  const scheme = page.protocol === "https:" ? "wss" : "ws";
  const address = `${scheme}://${page.host}/api/rooms/${encodeURIComponent(code)}/socket`;
  if (!token) {
    return address;
  }

  return `${address}?token=${encodeURIComponent(token)}`;
}
