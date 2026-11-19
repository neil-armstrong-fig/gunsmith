/**
 * Which pages may speak for a player. `ALLOWED_ORIGINS` is the site (comma separated, whole origins). `ALLOW_LOOPBACK_ORIGINS` is
 * `"true"` only where a local start script passed it (`wrangler dev --var`): never in `wrangler.jsonc` or `infra/`, so a deployed
 * Worker cannot have it and a page on someone's own localhost cannot speak for a player there.
 */
export interface OriginSettings {
  ALLOWED_ORIGINS: string;
  ALLOW_LOOPBACK_ORIGINS?: string;
}
