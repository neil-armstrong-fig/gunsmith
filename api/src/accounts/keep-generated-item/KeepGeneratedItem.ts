import {database} from "@src/accounts/Database";
import {generatedItems} from "@src/accounts/schema/GeneratedItems";
import type {NewGeneratedItem} from "@src/accounts/types/NewGeneratedItem";

/** Keeps what a request generated, off the shelf, under its id: the result as JSON, the prompt that made it and when. */
export async function keepGeneratedItem({id, userId, kind, prompt, payload, now}: NewGeneratedItem): Promise<void> {
  await database()
    .insert(generatedItems)
    .values({id, userId, kind, prompt, payload: JSON.stringify(payload), createdAt: now});
}
