import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {ITEM_KINDS} from "./ItemKinds";
import {users} from "./Users";

/**
 * Every weapon or arena a player's request made, kept by id so the library only ever lifts out what the server itself made (the
 * client names an id, never a body). `saved_at` is empty until the player puts it on their shelf. `payload` is JSON text. Erased with the account.
 */
export const generatedItems = sqliteTable(
  "generated_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {onDelete: "cascade"}),
    kind: text("kind", {enum: ITEM_KINDS}).notNull(),
    prompt: text("prompt").notNull(),
    payload: text("payload").notNull(),
    createdAt: integer("created_at", {mode: "timestamp"}).notNull(),
    savedAt: integer("saved_at", {mode: "timestamp"}),
  },
  table => [index("generated_items_user_id_saved_at").on(table.userId, table.savedAt)],
);
