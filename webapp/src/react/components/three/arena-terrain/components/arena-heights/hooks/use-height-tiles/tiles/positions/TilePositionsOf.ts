import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The position of every tile in the arena, south to north and west to east, walls and low ground included. */
export function tilePositionsOf(arena: Arena): Point[] {
  const positions: Point[] = [];

  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      positions.push({x, y});
    }
  }

  return positions;
}
