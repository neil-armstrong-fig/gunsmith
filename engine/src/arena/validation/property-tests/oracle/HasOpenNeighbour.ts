import {neighboursOf} from "@gunsmith/engine/arena/validation/property-tests/oracle/NeighboursOf";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/** Whether any tile that touches the tile at `index` along an edge is floor. */
export function hasOpenNeighbour(arena: Arena, index: number): boolean {
  return neighboursOf(arena, index).some(neighbour => {
    return !arena.solid[neighbour];
  });
}
