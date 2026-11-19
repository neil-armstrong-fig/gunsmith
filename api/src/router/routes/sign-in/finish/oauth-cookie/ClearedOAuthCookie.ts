import {OAUTH_COOKIE_NAME} from "@src/router/routes/sign-in/oauth/OAuthCookieName";

/** The `Set-Cookie` that ends an attempt once it has been used or has failed. */
export function clearedOauthCookie(): string {
  return `${OAUTH_COOKIE_NAME}=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
