import {OAUTH_COOKIE_NAME} from "@src/router/routes/sign-in/oauth/OAuthCookieName";
import type {OAuthAttempt} from "@src/router/routes/sign-in/oauth/types/OAuthAttempt";

const OAUTH_COOKIE_SECONDS = 600;

/**
 * The `Set-Cookie` that keeps an attempt for ten minutes: `HttpOnly` (no script reads the verifier), `Secure`, `SameSite=Lax` (it must
 * come back on Google's redirect, a top-level GET) and scoped to the sign-in path so nothing else carries it.
 */
export function oauthCookie(attempt: OAuthAttempt): string {
  const bytes = new TextEncoder().encode(JSON.stringify(attempt));
  const value = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `${OAUTH_COOKIE_NAME}=${value}; Path=/api/auth/google; Max-Age=${OAUTH_COOKIE_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}
