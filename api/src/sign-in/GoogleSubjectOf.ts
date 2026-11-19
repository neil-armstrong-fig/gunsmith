import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {GOOGLE} from "@src/sign-in/GoogleServer";
import type {GoogleExchange} from "@src/sign-in/types/GoogleExchange";
import * as oauth from "oauth4webapi";

/**
 * Exchanges the returned code for Google's subject id of the player. `oauth4webapi` checks the ID token's issuer, audience and expiry;
 * its signature is not checked, which OpenID Connect allows for a token received straight from the token endpoint over TLS. Throws for
 * anything it does not trust (a state that is not the attempt's, a refused code, no ID token).
 */
export async function googleSubjectOf({
  code,
  receivedState,
  expectedState,
  codeVerifier,
  redirectUri,
}: GoogleExchange): Promise<string> {
  const client: oauth.Client = {client_id: workerEnvironment.GOOGLE_OAUTH_CLIENT_ID ?? ""};
  const parameters = oauth.validateAuthResponse(
    GOOGLE,
    client,
    new URLSearchParams({code, state: receivedState}),
    expectedState,
  );
  const response = await oauth.authorizationCodeGrantRequest(
    GOOGLE,
    client,
    oauth.ClientSecretPost(workerEnvironment.GOOGLE_OAUTH_CLIENT_SECRET ?? ""),
    parameters,
    redirectUri,
    codeVerifier,
    // A plain function: the Workers runtime throws "Illegal invocation" for `fetch` called as a method of another object.
    {[oauth.customFetch]: (input, init) => fetch(input, init)},
  );
  const result = await oauth.processAuthorizationCodeResponse(GOOGLE, client, response);
  const claims = oauth.getValidatedIdTokenClaims(result);
  if (!claims) {
    throw new Error("Google's answer carried no ID token");
  }

  return claims.sub;
}
