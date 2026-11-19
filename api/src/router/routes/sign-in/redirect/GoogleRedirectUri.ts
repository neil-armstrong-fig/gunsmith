import type {SignInSettings} from "@src/router/routes/sign-in/types/SignInSettings";

/**
 * Where Google sends the player back: the callback on the address the request came to, or `GOOGLE_REDIRECT_URI` when set (behind a
 * dev proxy the Worker sees its own port, not the browser's, and Google only allows addresses registered with the OAuth client).
 */
export function googleRedirectUri(request: Request, settings: SignInSettings): string {
  return settings.GOOGLE_REDIRECT_URI ?? `${new URL(request.url).origin}/api/auth/google/callback`;
}
