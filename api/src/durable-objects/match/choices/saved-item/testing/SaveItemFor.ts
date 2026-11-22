import {saveItem} from "@src/accounts/save-item/SaveItem";
import {keepItemFor} from "@src/durable-objects/match/choices/saved-item/testing/KeepItemFor";
import type {ItemOfAccount} from "@src/durable-objects/match/choices/saved-item/testing/types/ItemOfAccount";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";

/** For a choices test: the account keeps a generated item and puts it on its shelf, as the library route does for a saved one. */
export async function saveItemFor(item: ItemOfAccount): Promise<void> {
  await keepItemFor(item);
  await saveItem({id: item.id, userId: item.accountId, now: new Date("2026-11-22T12:00:00Z"), limits: SHELF_LIMITS});
}
