import {database} from "@src/shared/accounts/Database";
import {limitOfKind} from "@src/shared/accounts/limit-of-kind/LimitOfKind";
import {generatedItems} from "@src/shared/accounts/schema/GeneratedItems";
import type {SaveItemRequest} from "@src/shared/accounts/types/SaveItemRequest";
import type {SaveItemResult} from "@src/shared/accounts/types/SaveItemResult";
import {and, eq, sql} from "drizzle-orm";

/**
 * Puts one of the account's kept items on its shelf. **The limit is checked in the same statement that saves**, so saves that
 * arrive together cannot fill more places than there are (a count read first and a write after would let them all through). When
 * nothing was saved a read says why: no such item for this account (`not-found`; another account's id looks the same), already on the
 * shelf (`saved`, unmoved) or its kind's space is used (`full`, with the kind and limit).
 */
export async function saveItem({id, userId, now, limits}: SaveItemRequest): Promise<SaveItemResult> {
  const shelf = database();
  const result = await shelf
    .update(generatedItems)
    .set({savedAt: now})
    .where(
      and(
        eq(generatedItems.id, id),
        eq(generatedItems.userId, userId),
        sql`${generatedItems.savedAt} IS NULL`,
        sql`(SELECT count(*) FROM generated_items AS shelf WHERE shelf.user_id = ${userId} AND shelf.kind = ${generatedItems.kind} AND shelf.saved_at IS NOT NULL) < CASE ${generatedItems.kind} WHEN 'weapon' THEN ${limits.weapons} ELSE ${limits.arenas} END`,
      ),
    );
  if (result.meta.changes > 0) {
    return {status: "saved"};
  }

  const [item] = await shelf
    .select({kind: generatedItems.kind, savedAt: generatedItems.savedAt})
    .from(generatedItems)
    .where(and(eq(generatedItems.id, id), eq(generatedItems.userId, userId)));
  if (!item) {
    return {status: "not-found"};
  }
  if (item.savedAt) {
    return {status: "saved"};
  }

  return {status: "full", kind: item.kind, limit: limitOfKind(limits, item.kind)};
}
