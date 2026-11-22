import type {PageAddress} from "@src/online/types/PageAddress";

/** The deployed webapp and its separate API Worker. */
const DEPLOYED_HOST = "gunsmith.neilarmstrong.dev";
const DEPLOYED_API_HOST = "gunsmith-api.neilarmstrong.dev";

/** Where the page's requests to the API go: the page's own origin, where Vite or the host proxies `/api`, and the API's hostname for the deployed webapp. */
export function apiOriginOfPage(page: PageAddress, protocol = page.protocol): string {
  if (page.protocol === "https:" && page.host === DEPLOYED_HOST) {
    return `${protocol}//${DEPLOYED_API_HOST}`;
  }

  return `${protocol}//${page.host}`;
}
