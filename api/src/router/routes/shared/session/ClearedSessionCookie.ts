import {SESSION_COOKIE_NAME} from "@src/router/routes/shared/session/SessionCookieName";

/** The `Set-Cookie` that signs a player out in their browser. */
export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
