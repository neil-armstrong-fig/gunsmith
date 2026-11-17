import {neighboursOf} from "@gunsmith/engine/arena-validation/property-tests/oracle/NeighboursOf";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/**
 * How many floor tiles each separate stretch of an arena has, found by plain four-way adjacency over its walls and nothing else,
 * largest first. Written out here rather than by the engine's route code so that the property it checks cannot agree with a
 * mistake there. It is only right for an arena with no stairs or heights.
 */
export function flatRegionSizes(arena: Arena): number[] {
  const seen = new Set<number>();
  const sizes: number[] = [];

  for (let start = 0; start < arena.solid.length; start += 1) {
    if (arena.solid[start] || seen.has(start)) {
      continue;
    }

    let size = 0;
    const pending = [start];
    seen.add(start);
    for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
      size += 1;
      for (const neighbour of neighboursOf(arena, next)) {
        if (!arena.solid[neighbour] && !seen.has(neighbour)) {
          seen.add(neighbour);
          pending.push(neighbour);
        }
      }
    }

    sizes.push(size);
  }

  return sizes.sort((a, b) => b - a);
}
