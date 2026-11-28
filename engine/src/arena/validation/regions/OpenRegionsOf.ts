import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";
import {walkingRoutesFrom} from "@gunsmith/engine/route/WalkingRoutesFrom";

/**
 * The open floor of an arena split into the stretches a walker can walk across (`walkingRoutesFrom`), so a platform with no
 * stair is a region of its own. They come in the order their first tile does, reading the arena from its south-west
 * corner along each row, and each starts with that tile.
 */
export function openRegionsOf(arena: Arena): readonly (readonly Point[])[] {
  const regions: Point[][] = [];
  const seen = new Set<string>();

  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      const start: Point = {x: x + 0.5, y: y + 0.5};
      if (arena.solid[y * arena.width + x] || seen.has(tileKeyOf(start))) {
        continue;
      }

      const region = [...walkingRoutesFrom(arena, start).values()].map(step => {
        return step.tile;
      });
      for (const tile of region) {
        seen.add(tileKeyOf(tile));
      }

      regions.push(region);
    }
  }

  return regions;
}
