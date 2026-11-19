import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {isCover} from "@gunsmith/engine/arena/IsCover";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The position of every wall tile in the arena, south to north and west to east within a row. A low cover block is solid but not a wall: it is drawn lower (`coverTilesOf`). */
export function wallTilesOf(arena: Arena): Point[] {
  const wallTiles: Point[] = [];

  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      if (isSolid(arena, x, y) && !isCover(arena, x, y)) {
        wallTiles.push({x, y});
      }
    }
  }

  return wallTiles;
}
