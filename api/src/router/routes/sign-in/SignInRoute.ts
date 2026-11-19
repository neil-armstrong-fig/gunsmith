import {finishSignInRoute} from "@src/router/routes/sign-in/finish/FinishSignInRoute";
import {startSignInRoute} from "@src/router/routes/sign-in/start/StartSignInRoute";

/**
 * Signing in with Google, its two addresses: `GET /api/auth/google` begins an attempt (`start/`) and `GET /api/auth/google/callback`
 * is where Google sends the player back to finish it (`finish/`). The router hands both here, so the folder has one front door.
 */
export async function signInRoute(request: Request): Promise<Response> {
  if (new URL(request.url).pathname === "/api/auth/google/callback") {
    return await finishSignInRoute(request);
  }

  return await startSignInRoute(request);
}
