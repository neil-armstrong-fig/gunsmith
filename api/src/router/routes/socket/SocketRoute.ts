import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {isFriendCode} from "@src/router/routes/shared/friend-code/IsFriendCode";

/**
 * `GET /api/rooms/<code>/socket` with a WebSocket upgrade: hands the request to the `Match` Durable Object named by the friend code,
 * which is where the match is played. A code that is not a friend code is refused (404) before any match is asked, and a request
 * without the upgrade is told to make one (426).
 */
export async function socketRoute(request: Request, env: ApiEnvironment, code: string): Promise<Response> {
  if (!isFriendCode(code)) {
    return Response.json({error: "not-found"}, {status: 404});
  }
  if (request.headers.get("Upgrade") !== "websocket") {
    return Response.json({error: "upgrade-required"}, {status: 426});
  }

  const match = env.MATCHES.get(env.MATCHES.idFromName(code));

  return await match.fetch(request);
}
