import {keepGeneratedItem} from "@src/accounts/keep-generated-item/KeepGeneratedItem";
import type {ItemOfAccount} from "@src/durable-objects/match/choices/saved-item/testing/types/ItemOfAccount";

/** For a choices test: the account keeps a generated item but never saves it, so it is not on its shelf. */
export async function keepItemFor({accountId, id, kind, payload}: ItemOfAccount): Promise<void> {
  await keepGeneratedItem({
    id,
    userId: accountId,
    kind,
    prompt: `prompt of ${id}`,
    payload,
    now: new Date("2026-11-22T11:00:00Z"),
  });
}
