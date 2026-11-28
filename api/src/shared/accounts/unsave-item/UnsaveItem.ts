import {database} from "@src/shared/accounts/Database";
import {generatedItems} from "@src/shared/accounts/schema/GeneratedItems";
import {and, eq} from "drizzle-orm";

/**
 * Takes an item off the account's shelf, freeing its place; the item itself stays, so its id still works. Answers whether the account
 * has such an item (an item already off the shelf counts), so another account's id is "not found", never touched.
 */
export async function unsaveItem(userId: string, id: string): Promise<boolean> {
  const result = await database()
    .update(generatedItems)
    .set({savedAt: null})
    .where(and(eq(generatedItems.id, id), eq(generatedItems.userId, userId)));

  return result.meta.changes > 0;
}
