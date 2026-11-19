import {deleteSession} from "@src/accounts/delete-session/DeleteSession";
import {clearedSessionCookie} from "@src/router/routes/log-out/cleared-session-cookie/ClearedSessionCookie";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";
import {sessionTokenFrom} from "@src/router/routes/shared/session/SessionTokenFrom";

/**
 * `POST /api/auth/logout`: ends the session the cookie carries (this one only, not the player's other sign-ins) and clears the
 * cookie. **It succeeds for someone who is not signed in** (204), so a page can call it without asking first. Only a store that
 * fails to end the session answers an error (500), and the cookie is cleared even then.
 */
export async function logOutRoute(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}});
  }

  const headers = {"Set-Cookie": clearedSessionCookie()};
  const token = sessionTokenFrom(request.headers.get("Cookie") ?? undefined);
  if (!token) {
    return new Response(null, {status: 204, headers});
  }

  try {
    await deleteSession(await hashSessionToken(token));
  } catch {
    return Response.json({error: "sign-out-failed"}, {status: 500, headers});
  }

  return new Response(null, {status: 204, headers});
}
