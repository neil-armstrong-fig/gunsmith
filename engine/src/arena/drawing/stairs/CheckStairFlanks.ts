import {uphillStep} from "@gunsmith/engine/arena/drawing/stairs/UphillStep";
import {whereIsTile} from "@gunsmith/engine/arena/drawing/stairs/WhereIsTile";
import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Throws for a stair with floor higher than its low end beside it. A walker on a stair may step onto either level it joins, so
 * raised floor at the stair's side would let them leave halfway up and skip the landing; a wall, the edge of the drawing or
 * ground no higher than the stair's low end leaves the landings as the only way on. Run after every stair has its level.
 */
export function checkStairFlanks(arena: DrawnArena): void {
  for (let index = 0; index < arena.stairs.length; index += 1) {
    const uphill = arena.stairs[index];
    if (uphill === undefined) {
      continue;
    }

    const x = index % arena.width;
    const y = Math.floor(index / arena.width);
    const step = uphillStep(uphill);
    const lowLevel = arena.levels[index] ?? 0;
    const sides: Point[] = [
      {x: x - step.y, y: y + step.x},
      {x: x + step.y, y: y - step.x},
    ];

    for (const side of sides) {
      if (isRaisedAbove(arena, side, lowLevel)) {
        throw new Error(
          `The stair at ${whereIsTile(arena.height, {x, y})} has raised floor beside it; only a wall or floor no higher than the stair's low end may stand there.`,
        );
      }
    }
  }
}

function isRaisedAbove(arena: DrawnArena, tile: Point, level: number): boolean {
  if (tile.x < 0 || tile.y < 0 || tile.x >= arena.width || tile.y >= arena.height) {
    return false;
  }

  const index = tile.y * arena.width + tile.x;
  if (arena.solid[index] === true) {
    return false;
  }

  return (arena.levels[index] ?? 0) > level;
}
