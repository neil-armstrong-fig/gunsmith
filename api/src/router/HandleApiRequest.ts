import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import {creditStatusRoute} from "@src/router/routes/credits/CreditStatusRoute";
import {openRoomRoute} from "@src/router/routes/rooms/OpenRoomRoute";
import {socketRoute} from "@src/router/routes/socket/SocketRoute";
import {generateWeaponRoute} from "@src/router/routes/weapons/GenerateWeaponRoute";
import type {GenerationPipelines} from "@src/router/types/GenerationPipelines";

const SOCKET_PATH = /^\/api\/rooms\/([^/]+)\/socket$/;

/**
 * Answers one request to `/api/*` by handing it to the route that owns the path (`routes/`, one folder each). `POST /api/rooms` opens a private room and answers its friend code; a WebSocket upgrade to
 * `/api/rooms/<code>/socket` is handed to that room's `Match` object, which is where the match is played. The same Worker serves
 * the site, so there is no CORS: the browser asks the page's own origin. `POST /api/weapons` and `POST /api/arenas` are the generation
 * routes (`routes/weapons/GenerateWeaponRoute`, `routes/arenas/GenerateArenaRoute`), each given its pipeline to run; the Worker gives none
 * until it has a production adapter, and the route then answers `ai-unavailable`. `GET /api/credits` is the read the selection panel
 * shows (`routes/credits/CreditStatusRoute`).
 */
export async function handleApiRequest(
  request: Request,
  env: ApiEnvironment,
  generationPipelines?: GenerationPipelines,
): Promise<Response> {
  const {pathname} = new URL(request.url);

  if (pathname === "/api/rooms") {
    return openRoomRoute(request);
  }

  if (pathname === "/api/weapons") {
    return await generateWeaponRoute(request, env, generationPipelines?.weaponSmith);
  }

  if (pathname === "/api/arenas") {
    return await generateArenaRoute(request, env, generationPipelines?.arenaSmith);
  }

  if (pathname === "/api/credits") {
    return await creditStatusRoute(request, env);
  }

  const socket = SOCKET_PATH.exec(pathname);
  if (socket) {
    return await socketRoute(request, env, socket[1] ?? "");
  }

  return Response.json({error: "not-found"}, {status: 404});
}
