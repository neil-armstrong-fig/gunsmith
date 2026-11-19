import {database} from "@src/accounts/Database";
import {generatedItems} from "@src/accounts/schema/GeneratedItems";
import type {SavedItem} from "@src/accounts/types/SavedItem";
import {and, asc, eq, isNotNull} from "drizzle-orm";

/** An account's shelf: the items it saved, in the order it saved them (the id breaks a tie). Another account's items never appear. */
export async function savedItemsOfAccount(userId: string): Promise<SavedItem[]> {
  const rows = await database()
    .select()
    .from(generatedItems)
    .where(and(eq(generatedItems.userId, userId), isNotNull(generatedItems.savedAt)))
    .orderBy(asc(generatedItems.savedAt), asc(generatedItems.id));

  return rows.flatMap(row => {
    if (!row.savedAt) {
      return [];
    }

    return [
      {
        id: row.id,
        kind: row.kind,
        prompt: row.prompt,
        payload: JSON.parse(row.payload) as unknown,
        savedAt: row.savedAt,
      },
    ];
  });
}
