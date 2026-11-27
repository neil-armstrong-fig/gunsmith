import {ARENA_ROTATION} from "@gunsmith/engine/arena-rotation/ArenaRotationLimits";
import {drawExtraArenas} from "@gunsmith/engine/arena-rotation/extras/DrawExtraArenas";
import {mostPlayedArenas} from "@gunsmith/engine/arena-rotation/most-played/MostPlayedArenas";
import type {ArenasOfDayInput} from "@gunsmith/engine/arena-rotation/types/ArenasOfDayInput";

/**
 * The `size` built-in arenas offered on a day: up to `mostPlayed` of yesterday's most played arenas, which stay, and the rest drawn,
 * each less likely the more it was played in the last `recentDays` days; after a day nobody played, the whole set is drawn afresh.
 * The ones drawn come first and the ones kept last, each in the pool's order, so a screen can show yesterday's together (the user,
 * 2026-11-26: the room's three to a row puts them on the second row). Only plays before `day` count, so the same day, pool and
 * earlier plays always give the same set, however many matches are played on the day itself, and any server can work it out for
 * itself. A pool no bigger than the set is offered whole. A pure rule: no clock, no random generator but the engine's seeded one, no storage; the caller counts the plays and
 * works out the day.
 */
export function arenasOfDay(input: ArenasOfDayInput): string[] {
  if (input.arenas.length <= ARENA_ROTATION.size) {
    return [...input.arenas];
  }

  const kept = mostPlayedArenas(input, ARENA_ROTATION.mostPlayed);
  const extras = drawExtraArenas(input, {kept, count: ARENA_ROTATION.size - kept.length});

  return [...input.arenas.filter(name => extras.includes(name)), ...input.arenas.filter(name => kept.includes(name))];
}
