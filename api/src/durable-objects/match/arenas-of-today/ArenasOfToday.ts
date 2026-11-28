import {ARENA_ROTATION} from "@gunsmith/engine/arena/rotation/ArenaRotationLimits";
import {arenasOfDay} from "@gunsmith/engine/arena/rotation/ArenasOfDay";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/arena/built-in/BuiltInArenas";
import {arenaPlaysSince} from "@src/shared/accounts/arena-plays-since/ArenaPlaysSince";
import {utcDay} from "@src/durable-objects/shared/utc/UtcDay";

/**
 * The built-in arenas a room made at `now` offers: the engine's `arenasOfDay` over the UTC day `now` falls in and the plays of the days
 * it reads (the most played of yesterday and the recent ones that make an arena less likely), counted by `countArenaPlay` as each match
 * begins. Every room made on one day gets the same five.
 */
export async function arenasOfToday(now: number): Promise<readonly string[]> {
  const day = utcDay(now);
  const plays = await arenaPlaysSince(day - ARENA_ROTATION.recentDays);

  return arenasOfDay({day, arenas: BUILT_IN_ARENAS.map(({name}) => name), plays});
}
