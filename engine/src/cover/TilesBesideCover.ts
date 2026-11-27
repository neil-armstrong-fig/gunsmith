import {isCover} from "@gunsmith/engine/arena/IsCover";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {BlockTile} from "@gunsmith/engine/cover/types/BlockTile";
import type {TilesFound} from "@gunsmith/engine/cover/types/TilesFound";
import type {Circle} from "@gunsmith/engine/geometry/types/Circle";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Each open tile at or beside a cover block whose centre lies inside `around`, once, by its corner (whole numbers), in the order the
 * blocks come, row by row. A block can hide only a place within `COVER_REACH_TILES` of it, never farther than the tiles around it,
 * so these are the only tiles a block can hide anyone on.
 */
export function tilesBesideCover(arena: Arena, around: Circle): readonly Point[] {
  const found: TilesFound = {seen: new Set<number>(), tiles: []};

  for (let tileY = 0; tileY < arena.height; tileY++) {
    for (let tileX = 0; tileX < arena.width; tileX++) {
      if (isCover(arena, tileX, tileY) && isInside(around, {x: tileX + 0.5, y: tileY + 0.5})) {
        collectNeighbours(arena, {tileX, tileY}, found);
      }
    }
  }

  return found.tiles;
}

function isInside(around: Circle, point: Point): boolean {
  return Math.hypot(point.x - around.centre.x, point.y - around.centre.y) <= around.radius;
}

function collectNeighbours(arena: Arena, block: BlockTile, found: TilesFound): void {
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      const tileX = block.tileX + offsetX;
      const tileY = block.tileY + offsetY;
      const key = tileY * arena.width + tileX;
      if (!isSolid(arena, tileX, tileY) && !found.seen.has(key)) {
        found.seen.add(key);
        found.tiles.push({x: tileX, y: tileY});
      }
    }
  }
}
