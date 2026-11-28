import type {ArenaPlays} from "@gunsmith/engine/arena/rotation/types/ArenaPlays";
import {gte} from "drizzle-orm";
import {database} from "@src/shared/accounts/Database";
import {arenaPlays} from "@src/shared/accounts/schema/ArenaPlays";

/** How many matches began on each arena on `day` (UTC days since 1970) and every day after it, one entry per arena and day. */
export async function arenaPlaysSince(day: number): Promise<ArenaPlays[]> {
  const rows = await database().select().from(arenaPlays).where(gte(arenaPlays.day, day));

  return rows.map(row => ({arena: row.arena, day: row.day, count: row.plays}));
}
