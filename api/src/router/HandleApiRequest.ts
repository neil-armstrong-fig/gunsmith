import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {generateWeaponRoute} from "@src/generation/GenerateWeaponRoute";
import type {WeaponSmith} from "@src/generation/types/WeaponSmith";
import {isFriendCode} from "@src/rooms/IsFriendCode";
import {makeFriendCode} from "@src/rooms/MakeFriendCode";

const SOCKET_PATH = /^\/api\/rooms\/([^/]+)\/socket$/;

/**
 * Answers one request to `/api/*`. `POST /api/rooms` opens a private room and answers its friend code; a WebSocket upgrade to
 * `/api/rooms/<code>/socket` is handed to that room's `Match` object, which is where the match is played. The same Worker serves
 * the site, so there is no CORS: the browser asks the page's own origin. `POST /api/weapons` is the generation route
 * (`generation/GenerateWeaponRoute`), given the pipeline to run; the Worker gives none until it has a production adapter, and the
 * route then answers `ai-unavailable`.
 */
export async function handleApiRequest(
  request: Request,
  env: ApiEnvironment,
  weaponSmith?: WeaponSmith,
): Promise<Response> {
  const {pathname} = new URL(request.url);

  if (pathname === "/api/rooms") {
    return roomsAnswer(request);
  }

  if (pathname === "/api/weapons") {
    return await generateWeaponRoute(request, env, weaponSmith);
  }

  const socket = SOCKET_PATH.exec(pathname);
  if (socket) {
    return await socketAnswer(request, env, socket[1] ?? "");
  }

  return Response.json({error: "not-found"}, {status: 404});
}

function roomsAnswer(request: Request): Response {
  if (request.method !== "POST") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}});
  }

  return Response.json({code: makeFriendCode()}, {status: 201});
}

async function socketAnswer(request: Request, env: ApiEnvironment, code: string): Promise<Response> {
  if (!isFriendCode(code)) {
    return Response.json({error: "not-found"}, {status: 404});
  }
  if (request.headers.get("Upgrade") !== "websocket") {
    return Response.json({error: "upgrade-required"}, {status: 426});
  }

  const match = env.MATCHES.get(env.MATCHES.idFromName(code));

  return await match.fetch(request);
}
