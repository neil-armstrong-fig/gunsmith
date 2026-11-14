import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The index of the tile at `tile` when it is plain floor, not a wall, a stair or beyond the drawing; otherwise `undefined`. */
export function landingIndex(arena: DrawnArena, tile: Point): number | undefined {
  if (tile.x < 0 || tile.y < 0 || tile.x >= arena.width || tile.y >= arena.height) {
    return undefined;
  }

  const index = tile.y * arena.width + tile.x;
  if (arena.solid[index] === true || arena.stairs[index] !== undefined) {
    return undefined;
  }

  return index;
}
