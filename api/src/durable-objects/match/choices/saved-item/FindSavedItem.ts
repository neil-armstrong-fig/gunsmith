import {savedItemsOfAccount} from "@src/accounts/saved-items-of-account/SavedItemsOfAccount";
import type {ItemKind} from "@src/accounts/types/ItemKind";
import type {SavedItem} from "@src/accounts/types/SavedItem";

/**
 * One item on the account's own shelf, by id and kind, or `undefined`. The shelf holds only what the account saved, so another
 * account's item and one kept but never saved are not found, and an id of the other kind is no weapon or arena.
 */
export async function findSavedItem(accountId: string, id: string, kind: ItemKind): Promise<SavedItem | undefined> {
  const shelf = await savedItemsOfAccount(accountId);

  return shelf.find(item => item.id === id && item.kind === kind);
}
