import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {openRegionsOf} from "@gunsmith/engine/arena/validation/regions/OpenRegionsOf";
import type {DrawingRegions} from "@gunsmith/engine/arena/repair/types/DrawingRegions";
import type {DrawnTile} from "@gunsmith/engine/arena/repair/types/DrawnTile";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * The open floor of a readable drawing in the pieces `validateArena` sees, with the same choice of which is the arena (the
 * largest, the first of equals), each tile named by its place in the drawing. Throws for a drawing `arenaFrom` cannot read.
 */
export function regionsOfDrawing(rows: readonly string[]): DrawingRegions {
  const height = rows.length;
  const regions = openRegionsOf(arenaFrom(rows)).map(region => {
    return region.map(point => drawnTileOf(point, height));
  });

  let main: DrawnTile[] = [];
  for (const region of regions) {
    if (region.length > main.length) {
      main = region;
    }
  }

  return {main, cutOff: regions.filter(region => region !== main)};
}

function drawnTileOf(point: Point, height: number): DrawnTile {
  return {column: Math.floor(point.x), row: height - 1 - Math.floor(point.y)};
}
