import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Which level a point is on: the level of its tile, or half way between the two levels a stair joins, anywhere on that stair. */
export function levelAt(arena: Arena, point: Point): number {
  const tileX = Math.floor(point.x);
  const tileY = Math.floor(point.y);
  const level = levelOfTile(arena, tileX, tileY);

  if (stairOfTile(arena, tileX, tileY) === undefined) {
    return level;
  }

  return level + 0.5;
}
