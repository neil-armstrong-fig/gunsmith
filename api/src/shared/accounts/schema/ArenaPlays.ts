import {integer, primaryKey, sqliteTable, text} from "drizzle-orm/sqlite-core";

/** How many matches began on each built-in arena on each UTC day (days since 1970), everyone's together: what the day's arenas are drawn from. */
export const arenaPlays = sqliteTable(
  "arena_plays",
  {
    day: integer("day").notNull(),
    arena: text("arena").notNull(),
    plays: integer("plays").notNull(),
  },
  table => [primaryKey({columns: [table.day, table.arena]})],
);
