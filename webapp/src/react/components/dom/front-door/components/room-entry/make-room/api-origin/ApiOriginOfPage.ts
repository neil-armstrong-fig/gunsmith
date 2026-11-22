import type {PageAddress} from "@src/online/socket/types/PageAddress";

/** The deployed webapp's host, whose API is a Worker of its own on another host (`online/socket/RoomSocketUrl` says the same for the socket). */
const DEPLOYED_HOST = "gunsmith.neilarmstrong.dev";
const DEPLOYED_API_ORIGIN = "https://gunsmith-api.neilarmstrong.dev";

/** Where the page's requests to the API go: the page's own origin, where Vite or the host proxies `/api`, and the API's hostname for the deployed webapp. */
export function apiOriginOfPage(page: PageAddress): string {
  if (page.protocol === "https:" && page.host === DEPLOYED_HOST) {
    return DEPLOYED_API_ORIGIN;
  }

  return `${page.protocol}//${page.host}`;
}
