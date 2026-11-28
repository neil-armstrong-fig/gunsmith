import {sql} from "drizzle-orm";
import {database} from "@src/shared/accounts/Database";
import {arenaPlays} from "@src/shared/accounts/schema/ArenaPlays";

/** One more match began on `arena` on `day` (UTC days since 1970): the first makes the day's row, each later one adds to it in the same statement. */
export async function countArenaPlay(arena: string, day: number): Promise<void> {
  await database()
    .insert(arenaPlays)
    .values({day, arena, plays: 1})
    .onConflictDoUpdate({target: [arenaPlays.day, arenaPlays.arena], set: {plays: sql`${arenaPlays.plays} + 1`}});
}
