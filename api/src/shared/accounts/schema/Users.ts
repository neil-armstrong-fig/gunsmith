import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

/** One row per player. No email and no real name: Google's `sub` (to find the account again) and a generated display name. */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  googleSub: text("google_sub").notNull().unique(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at", {mode: "timestamp"}).notNull(),
});
