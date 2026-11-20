import {claimDeletedAccountId} from "@src/accounts/claim-deleted-account-id/ClaimDeletedAccountId";
import {createSession} from "@src/accounts/create-session/CreateSession";
import {findOrCreateAccount} from "@src/accounts/find-or-create-account/FindOrCreateAccount";
import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {generatedDisplayName} from "@src/router/routes/sign-in/finish/generated-display-name/GeneratedDisplayName";
import {logSignInFailure} from "@src/router/routes/sign-in/finish/failure-log/LogSignInFailure";
import type {SignInFailure} from "@src/router/routes/sign-in/finish/types/SignInFailure";
import {googleRedirectUri} from "@src/router/routes/sign-in/redirect/GoogleRedirectUri";
import {loginAllowed} from "@src/router/routes/sign-in/login-limit/LoginAllowed";
import {clearedOauthCookie} from "@src/router/routes/sign-in/finish/oauth-cookie/ClearedOAuthCookie";
import {oauthAttemptFrom} from "@src/router/routes/sign-in/finish/oauth-cookie/OAuthAttemptFrom";
import {respondRedirect} from "@src/router/routes/sign-in/redirect/RespondRedirect";
import {returnAddress} from "@src/router/routes/sign-in/redirect/ReturnAddress";
import {isSubjectDigestConfigured} from "@src/router/routes/shared/subject-digest/IsSubjectDigestConfigured";
import {subjectDigest} from "@src/router/routes/shared/subject-digest/SubjectDigest";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";
import {randomToken} from "@src/router/routes/shared/session/RandomToken";
import {sessionCookie} from "@src/router/routes/sign-in/finish/session-cookie/SessionCookie";
import {SESSION_LIFETIME_SECONDS} from "@src/router/routes/sign-in/finish/session-cookie/SessionLifetime";
import {googleSubjectOf} from "@src/sign-in/GoogleSubjectOf";
import {isGoogleConfigured} from "@src/sign-in/IsGoogleConfigured";

/**
 * `GET /api/auth/google/callback`: where Google sends the player back. Checks the `state` against the attempt kept in the cookie,
 * exchanges the code, finds or makes the account (its id is a fresh random one, never Google's subject), starts a session (the
 * database keeps only the token's hash) and sends the player on to where they came from. **Every failure sends them back signed
 * out**, with the attempt ended and one closed event logged: there is no error page to read a reason from.
 */
export async function finishSignInRoute(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "GET"}});
  }
  if (!(await loginAllowed(workerEnvironment.LOGIN_LIMITER, request))) {
    return Response.json({error: "too-many-requests"}, {status: 429});
  }

  const attempt = oauthAttemptFrom(request.headers.get("Cookie") ?? undefined);
  if (!attempt) {
    return signedOut("no-attempt", "/");
  }

  const returnTo = returnAddress(attempt.returnTo, workerEnvironment);
  const {searchParams} = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return signedOut("no-code", returnTo);
  }

  const state = searchParams.get("state");
  if (state !== attempt.state) {
    return signedOut("state-mismatch", returnTo);
  }
  if (!isGoogleConfigured()) {
    return signedOut("unavailable", returnTo);
  }

  try {
    const subject = await googleSubjectOf({
      code,
      receivedState: state,
      expectedState: attempt.state,
      codeVerifier: attempt.codeVerifier,
      redirectUri: googleRedirectUri(request, workerEnvironment),
    });
    const now = new Date();
    const account = await findOrCreateAccount(subject, {
      id: (await creditIdOfDeletedAccount(subject, now)) ?? crypto.randomUUID(),
      displayName: generatedDisplayName(),
      now,
    });
    const token = randomToken();
    await createSession({
      idHash: await hashSessionToken(token),
      userId: account.id,
      expiresAt: new Date(now.getTime() + SESSION_LIFETIME_SECONDS * 1000),
    });

    return respondRedirect(returnTo, [sessionCookie(token), clearedOauthCookie()]);
  } catch (error) {
    return signedOut("failed", returnTo, error);
  }
}

function signedOut(failure: SignInFailure, returnTo: string, error?: unknown): Response {
  logSignInFailure(failure, error);

  return respondRedirect(returnTo, [clearedOauthCookie()]);
}

/**
 * The id a person's deleted account was held under, if it is still being kept: the new account takes it, so deleting and signing in
 * again does not reset the daily credits (`DELETE /api/account`). Asked of the keyed digest, never the subject. With no key set nothing
 * could have been kept, so nothing is asked. A failure to read it ends the sign-in (signed out) rather than hand out a fresh allowance.
 */
async function creditIdOfDeletedAccount(googleSub: string, now: Date): Promise<string | undefined> {
  if (!isSubjectDigestConfigured()) {
    return undefined;
  }

  return await claimDeletedAccountId(await subjectDigest(googleSub), now);
}
