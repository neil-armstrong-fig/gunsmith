import {listShelf} from "@src/router/routes/library/list-shelf/ListShelf";
import {removeFromShelf} from "@src/router/routes/library/remove/RemoveFromShelf";
import {saveToShelf} from "@src/router/routes/library/save/SaveToShelf";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";

const SHELF_PATH = "/api/library";
const ITEM_PATH = /^\/api\/library\/([^/]+)$/;

/**
 * The library, a signed-in player's saved weapons and arenas: `GET /api/library` (the shelf and its limits), `POST /api/library`
 * (save a kept item by id) and `DELETE /api/library/<id>` (take it off). Guards in order, each reading nothing until it has passed:
 * the path (404), the method (405 with what the path allows), the account (401: the session cookie, never a header a caller could
 * write). The page never sends an item's body, only its id (`save/SaveToShelf`).
 */
export async function libraryRoute(request: Request): Promise<Response> {
  const {pathname} = new URL(request.url);
  const item = ITEM_PATH.exec(pathname);
  if (pathname !== SHELF_PATH && !item) {
    return Response.json({error: "not-found"}, {status: 404});
  }

  const allowed = allowedMethods(item !== null);
  if (!allowed.split(", ").includes(request.method)) {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: allowed}});
  }

  const account = await accountOfRequest(request);
  if (!account) {
    return Response.json({error: "account-required"}, {status: 401});
  }

  if (item?.[1]) {
    return await removeFromShelf(account.id, item[1]);
  }
  if (request.method === "POST") {
    return await saveToShelf(account.id, request);
  }

  return await listShelf(account.id);
}

function allowedMethods(isItemPath: boolean): string {
  if (isItemPath) {
    return "DELETE";
  }

  return "GET, POST";
}
