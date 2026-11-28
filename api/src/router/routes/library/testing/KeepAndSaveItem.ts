import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {keepItem} from "@src/router/routes/library/testing/KeepItem";
import type {ItemToSave} from "@src/router/routes/library/testing/types/ItemToSave";

/** For a library test: keeps an item for the account and puts it on the shelf at the time given. */
export async function keepAndSaveItem({accountId, id, kind, savedAt}: ItemToSave): Promise<void> {
  await keepItem(accountId, id, kind);
  await saveItem({id, userId: accountId, now: savedAt, limits: SHELF_LIMITS});
}
