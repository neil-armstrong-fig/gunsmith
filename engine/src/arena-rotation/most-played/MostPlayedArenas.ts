import type {ArenasOfDayInput} from "@gunsmith/engine/arena-rotation/types/ArenasOfDayInput";

/**
 * Up to `count` of the arenas played the day before the day asked for, the most played first. Only that one day counts, so the
 * kept arenas follow what people played most recently, and an arena nobody played that day is not among them (with nothing played,
 * nothing is kept and the whole set is drawn). Arenas played the same number of times go in the pool's order. A play of an arena
 * that is not in the pool counts for nothing.
 */
export function mostPlayedArenas(input: ArenasOfDayInput, count: number): string[] {
  const totals = new Map<string, number>();
  for (const {arena, day, count: plays} of input.plays) {
    if (day === input.day - 1) {
      totals.set(arena, (totals.get(arena) ?? 0) + plays);
    }
  }

  const ranked = input.arenas
    .map((name, index) => ({name, index, total: totals.get(name) ?? 0}))
    .filter(({total}) => total > 0);
  ranked.sort((first, second) => {
    if (first.total !== second.total) {
      return second.total - first.total;
    }

    return first.index - second.index;
  });

  return ranked.slice(0, count).map(({name}) => name);
}
