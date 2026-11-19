import type {OriginSettings} from "@src/router/routes/shared/origin/types/OriginSettings";

/**
 * What the sign-in routes read from the Worker's settings: the origins that may speak for a player (and be returned to), the
 * limiter that keeps a script from hammering sign-in, and, for local use, where Google returns to (behind a dev proxy the Worker
 * cannot tell which address the browser used). The OAuth client itself is only in `ApiWorker.ts`'s wiring.
 */
export interface SignInSettings extends OriginSettings {
  LOGIN_LIMITER: RateLimit;
  GOOGLE_REDIRECT_URI?: string;
}
