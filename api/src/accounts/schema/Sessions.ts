import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {users} from "./Users";

/** A sign-in that is still good: the hash of its token (never the token), whose it is and when it stops working. */
export const sessions = sqliteTable(
  "sessions",
  {
    idHash: text("id_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {onDelete: "cascade"}),
    expiresAt: integer("expires_at", {mode: "timestamp"}).notNull(),
  },
  table => [index("sessions_user_id").on(table.userId)],
);
