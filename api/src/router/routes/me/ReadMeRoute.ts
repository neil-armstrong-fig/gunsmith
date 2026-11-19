import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";

const NO_STORE = {"Cache-Control": "private, no-store"};

/**
 * `GET /api/me`: the browser's one question, who is signed in. Always 200 with `{signedIn, displayName?}`, never a 401, so a guest's
 * page logs nothing for asking. It answers the display name only (no account id, no Google subject) and is never cached.
 */
export async function readMeRoute(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "GET"}});
  }

  const account = await accountOfRequest(request);
  if (!account) {
    return Response.json({signedIn: false}, {headers: NO_STORE});
  }

  return Response.json({signedIn: true, displayName: account.displayName}, {headers: NO_STORE});
}
