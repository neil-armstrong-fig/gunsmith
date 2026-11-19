import {keepGeneratedItem} from "@src/accounts/keep-generated-item/KeepGeneratedItem";
import type {ItemKind} from "@src/accounts/types/ItemKind";

/** For a library test: makes the account own a kept item as a generation route would have, weapons with a drawing, arenas with rows. */
export async function keepItem(accountId: string, id: string, kind: ItemKind): Promise<void> {
  await keepGeneratedItem({
    id,
    userId: accountId,
    kind,
    prompt: `prompt of ${id}`,
    payload: payloadOf(kind, id),
    now: new Date("2026-11-19T12:00:00Z"),
  });
}

function payloadOf(kind: ItemKind, id: string): unknown {
  if (kind === "weapon") {
    return {weapon: {name: id}, appearance: {shapes: [id]}};
  }

  return {arena: {rows: [id]}};
}
