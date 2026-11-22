import {makeFriendCode} from "@src/router/routes/rooms/friend-code/MakeFriendCode";

/** `POST /api/rooms`: opens a private room and answers its friend code (201). The room itself exists once its first player connects. */
export function openRoomRoute(request: Request): Response {
  if (request.method !== "POST") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "POST"}});
  }

  return Response.json({code: makeFriendCode()}, {status: 201});
}
