import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {googleRedirectUri} from "@src/router/routes/sign-in/redirect/GoogleRedirectUri";
import {loginAllowed} from "@src/router/routes/sign-in/login-limit/LoginAllowed";
import {oauthCookie} from "@src/router/routes/sign-in/start/oauth-cookie/OAuthCookie";
import {respondRedirect} from "@src/router/routes/sign-in/redirect/RespondRedirect";
import {returnAddress} from "@src/router/routes/sign-in/redirect/ReturnAddress";
import {randomToken} from "@src/router/routes/shared/session/RandomToken";
import {googleAuthorizationUrl} from "@src/router/routes/sign-in/google/GoogleAuthorizationUrl";
import {isGoogleConfigured} from "@src/router/routes/sign-in/google/IsGoogleConfigured";

/**
 * `GET /api/auth/google?return=<page>`: begins a sign-in. Chooses a random `state` and PKCE verifier, keeps them with the checked
 * return address in a short cookie (`oauth-cookie/`) and sends the player to Google. **Nothing here ever shows an error page**: a
 * Worker with no Google client, a client that cannot build the address, all send the player back signed out. Only a limiter that
 * says too many answers (429), and only a method other than GET is refused (405).
 */
export async function startSignInRoute(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "GET"}});
  }
  if (!(await loginAllowed(workerEnvironment.LOGIN_LIMITER, request))) {
    return Response.json({error: "too-many-requests"}, {status: 429});
  }

  const returnTo = returnAddress(new URL(request.url).searchParams.get("return") ?? undefined, workerEnvironment);
  if (!isGoogleConfigured()) {
    return respondRedirect(returnTo);
  }

  const state = randomToken();
  const codeVerifier = randomToken();
  try {
    const url = await googleAuthorizationUrl({
      state,
      codeVerifier,
      redirectUri: googleRedirectUri(request, workerEnvironment),
    });

    return respondRedirect(url.href, [oauthCookie({state, codeVerifier, returnTo})]);
  } catch {
    return respondRedirect(returnTo);
  }
}
