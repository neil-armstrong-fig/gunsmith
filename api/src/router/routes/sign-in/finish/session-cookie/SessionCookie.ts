import {SESSION_COOKIE_NAME} from "@src/router/routes/shared/session/SessionCookieName";
import {SESSION_LIFETIME_SECONDS} from "@src/router/routes/sign-in/finish/session-cookie/SessionLifetime";

/** The `Set-Cookie` that signs a player in: `HttpOnly` (no script reads it), `Secure`, `SameSite=Lax`, for the whole site. */
export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_LIFETIME_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}
