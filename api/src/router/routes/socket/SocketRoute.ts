import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {isFriendCode} from "@gunsmith/shared/online/friend-code/IsFriendCode";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import {SEAT_ACCOUNT_HEADER} from "@src/seat-account/SeatAccountHeader";

/**
 * `GET /api/rooms/<code>/socket` with a WebSocket upgrade: hands the request to the `Match` Durable Object named by the friend code,
 * which is where the match is played. A code that is not a friend code is refused (404) before any match is asked, and a request
 * without the upgrade is told to make one (426). The match is told whose session came with the socket (`SEAT_ACCOUNT_HEADER`, absent for a
 * guest): the header is the Worker's alone, so one a page sent is dropped, and only a live session names an account.
 */
export async function socketRoute(request: Request, code: string): Promise<Response> {
  if (!isFriendCode(code)) {
    return Response.json({error: "not-found"}, {status: 404});
  }
  if (request.headers.get("Upgrade") !== "websocket") {
    return Response.json({error: "upgrade-required"}, {status: 426});
  }

  const match = workerEnvironment.MATCHES.get(workerEnvironment.MATCHES.idFromName(code));

  return await match.fetch(await withSeatAccount(request));
}

/** `request` with `SEAT_ACCOUNT_HEADER` set to the account its session names, or without the header for a guest. */
async function withSeatAccount(request: Request): Promise<Request> {
  const headers = new Headers(request.headers);
  headers.delete(SEAT_ACCOUNT_HEADER);

  const account = await accountOfRequest(request);
  if (account) {
    headers.set(SEAT_ACCOUNT_HEADER, account.id);
  }

  return new Request(request, {headers});
}
