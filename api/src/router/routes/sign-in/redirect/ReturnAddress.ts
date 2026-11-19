import {isTrustedOrigin} from "@src/router/routes/shared/origin/IsTrustedOrigin";
import type {OriginSettings} from "@src/router/routes/shared/origin/types/OriginSettings";

/**
 * Where to send a player back after sign-in: the address they asked for **only if its whole origin is trusted**, else the front page.
 * A prefix test would let `https://site.evil.test` through, and a sign-in that redirects anywhere is an open redirect any page could use.
 */
export function returnAddress(asked: string | undefined, settings: OriginSettings): string {
  const url = asked ? URL.parse(asked) : null;
  if (!url || !isTrustedOrigin(url.origin, settings)) {
    return "/";
  }

  return url.href;
}
