import {isCover} from "@gunsmith/engine/arena/IsCover";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The position of every low cover block in the arena, south to north and west to east within a row. */
export function coverTilesOf(arena: Arena): Point[] {
  const coverTiles: Point[] = [];

  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      if (isCover(arena, x, y)) {
        coverTiles.push({x, y});
      }
    }
  }

  return coverTiles;
}
