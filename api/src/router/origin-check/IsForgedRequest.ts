import {isTrustedOrigin} from "@src/router/routes/shared/origin/IsTrustedOrigin";
import type {OriginSettings} from "@src/router/routes/shared/origin/types/OriginSettings";

const CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Whether a request asks for a change, or a socket, on behalf of a page that is not ours: a state-changing method or a WebSocket
 * upgrade whose `Origin` is not trusted (**a missing one included**: a browser always sends it). The session cookie is `SameSite=Lax`,
 * which already keeps other sites' forms and fetches from carrying it; this is the second lock. Reads, and the sign-in callback
 * (a GET Google sends the browser to), are not asked.
 */
export function isForgedRequest(request: Request, settings: OriginSettings): boolean {
  const asksForChange = CHANGING_METHODS.includes(request.method) || request.headers.get("Upgrade") === "websocket";
  if (!asksForChange) {
    return false;
  }

  return !isTrustedOrigin(request.headers.get("Origin") ?? undefined, settings);
}
