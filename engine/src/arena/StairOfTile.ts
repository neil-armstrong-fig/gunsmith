import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {TileStair} from "@gunsmith/engine/arena/types/TileStair";

/** The way the stair on the tile at (`tileX`, `tileY`) climbs, or `undefined` when the tile is not a stair, or is beyond the arena's edge. */
export function stairOfTile(arena: Arena, tileX: number, tileY: number): TileStair {
  if (tileX < 0 || tileY < 0 || tileX >= arena.width || tileY >= arena.height) {
    return undefined;
  }

  return arena.stairs[tileY * arena.width + tileX];
}
