import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {isForgedRequest} from "@src/router/origin-check/IsForgedRequest";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import {creditStatusRoute} from "@src/router/routes/credits/CreditStatusRoute";
import {libraryRoute} from "@src/router/routes/library/LibraryRoute";
import {logOutRoute} from "@src/router/routes/log-out/LogOutRoute";
import {readMeRoute} from "@src/router/routes/me/ReadMeRoute";
import {openRoomRoute} from "@src/router/routes/rooms/OpenRoomRoute";
import {signInRoute} from "@src/router/routes/sign-in/SignInRoute";
import {socketRoute} from "@src/router/routes/socket/SocketRoute";
import {generateWeaponRoute} from "@src/router/routes/weapons/GenerateWeaponRoute";

const SOCKET_PATH = /^\/api\/rooms\/([^/]+)\/socket$/;

/**
 * Answers one request to `/api/*` by handing it to the route that owns the path (`routes/`, one folder each). `POST /api/rooms` opens a private room and answers its friend code; a WebSocket upgrade to
 * `/api/rooms/<code>/socket` is handed to that room's `Match` object, which is where the match is played. The same Worker serves
 * the site, so there is no CORS: the browser asks the page's own origin. `POST /api/weapons` and `POST /api/arenas` are the generation
 * routes (`routes/weapons/GenerateWeaponRoute`, `routes/arenas/GenerateArenaRoute`), each given its pipeline to run; the Worker gives none
 * until it has a production adapter, and the route then answers `ai-unavailable`. `GET /api/credits` is the read the selection panel
 * shows (`routes/credits/CreditStatusRoute`). **Before any of them**, a state-changing request or a WebSocket upgrade from a page that is not
 * on the allowed-origins list is turned away (403 `forbidden-origin`, `origin-check/IsForgedRequest`). `/api/library` is the signed-in player's shelf (`routes/library/LibraryRoute`). `GET /api/me` answers who is signed in (`routes/me/ReadMeRoute`), `GET /api/auth/google` and its `/callback`
 * sign a player in with Google and `POST /api/auth/logout` out (`routes/sign-in/`, `routes/log-out/`).
 */
export async function handleApiRequest(request: Request): Promise<Response> {
  if (isForgedRequest(request, workerEnvironment)) {
    return Response.json({error: "forbidden-origin"}, {status: 403});
  }

  const {pathname} = new URL(request.url);

  if (pathname === "/api/rooms") {
    return openRoomRoute(request);
  }

  if (pathname === "/api/weapons") {
    return await generateWeaponRoute(request);
  }

  if (pathname === "/api/arenas") {
    return await generateArenaRoute(request);
  }

  if (pathname === "/api/credits") {
    return await creditStatusRoute(request);
  }

  if (pathname === "/api/library" || pathname.startsWith("/api/library/")) {
    return await libraryRoute(request);
  }

  if (pathname === "/api/me") {
    return await readMeRoute(request);
  }

  if (pathname === "/api/auth/google" || pathname === "/api/auth/google/callback") {
    return await signInRoute(request);
  }

  if (pathname === "/api/auth/logout") {
    return await logOutRoute(request);
  }

  const socket = SOCKET_PATH.exec(pathname);
  if (socket) {
    return await socketRoute(request, socket[1] ?? "");
  }

  return Response.json({error: "not-found"}, {status: 404});
}
