import {unsaveItem} from "@src/accounts/unsave-item/UnsaveItem";

/**
 * `DELETE /api/library/<id>`: takes one of the account's items off its shelf and frees the place. The item stays kept, so its id still
 * works. 404 for an id the account does not have; another account's item is never touched.
 */
export async function removeFromShelf(accountId: string, id: string): Promise<Response> {
  const found = await unsaveItem(accountId, id);
  if (!found) {
    return Response.json({error: "not-found"}, {status: 404});
  }

  return Response.json({status: "removed"});
}
