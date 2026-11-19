import type {OriginSettings} from "@src/router/routes/shared/origin/types/OriginSettings";

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1"];

/**
 * Whether a page's `Origin` may speak for a player: **the whole origin** is on the `ALLOWED_ORIGINS` list, never a prefix (a prefix
 * test would let `https://site.evil.test` through), or, only where `ALLOW_LOOPBACK_ORIGINS` is `"true"`, a plain-http page on
 * localhost or 127.0.0.1 at any port. A missing origin is no one.
 */
export function isTrustedOrigin(origin: string | undefined, settings: OriginSettings): boolean {
  if (!origin) {
    return false;
  }
  if (allowedOrigins(settings).includes(origin)) {
    return true;
  }

  return settings.ALLOW_LOOPBACK_ORIGINS === "true" && isLoopbackOrigin(origin);
}

function allowedOrigins(settings: OriginSettings): string[] {
  return settings.ALLOWED_ORIGINS.split(",")
    .map(origin => origin.trim())
    .filter(origin => origin !== "");
}

function isLoopbackOrigin(origin: string): boolean {
  const url = URL.parse(origin);
  if (!url) {
    return false;
  }

  // `url.origin` is the normalised form, so anything but a bare scheme, host and port (a path, a login) fails the comparison.
  return url.protocol === "http:" && LOOPBACK_HOSTS.includes(url.hostname) && url.origin === origin;
}
