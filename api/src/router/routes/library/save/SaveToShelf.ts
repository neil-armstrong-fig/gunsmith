import {saveItem} from "@src/accounts/save-item/SaveItem";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";

const LONGEST_ID = 100;

/**
 * `POST /api/library` with `{id}`: puts one of the account's kept items on its shelf. **The id is all the page sends**; whatever else
 * is in the body is ignored, so the item shelved is always what the server made. 400 for a body without a usable id, 404 for an id the
 * account does not have (another account's looks the same), **409 `shelf-full` with the kind and the limit when its space is used**
 * (the page asks which item to replace; nothing is ever dropped), and 200 when it is on the shelf, already or now.
 */
export async function saveToShelf(accountId: string, request: Request): Promise<Response> {
  const id = idOf(await request.text());
  if (id === undefined) {
    return Response.json({error: "bad-request"}, {status: 400});
  }

  const result = await saveItem({id, userId: accountId, now: new Date(), limits: SHELF_LIMITS});
  if (result.status === "not-found") {
    return Response.json({error: "not-found"}, {status: 404});
  }
  if (result.status === "full") {
    return Response.json({error: "shelf-full", kind: result.kind, limit: result.limit}, {status: 409});
  }

  return Response.json({status: "saved"});
}

function idOf(body: string): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  const {id} = parsed as Record<string, unknown>;
  if (typeof id !== "string" || id.length === 0 || id.length > LONGEST_ID) {
    return undefined;
  }

  return id;
}
