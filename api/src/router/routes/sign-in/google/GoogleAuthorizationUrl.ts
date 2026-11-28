import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {GOOGLE} from "@src/router/routes/sign-in/google/GoogleServer";
import type {GoogleAuthorization} from "@src/router/routes/sign-in/google/types/GoogleAuthorization";
import * as oauth from "oauth4webapi";

/**
 * Where to send the player: Google's authorization endpoint, for the authorization-code flow with PKCE (S256), asking for `openid` and
 * nothing else (no email, no name).
 */
export async function googleAuthorizationUrl({state, codeVerifier, redirectUri}: GoogleAuthorization): Promise<URL> {
  const url = new URL(GOOGLE.authorization_endpoint ?? "");
  url.searchParams.set("client_id", workerEnvironment.GOOGLE_OAUTH_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", await oauth.calculatePKCECodeChallenge(codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");

  return url;
}
