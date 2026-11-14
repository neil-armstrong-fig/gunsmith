import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {BlockedTiles} from "@gunsmith/engine/movement/types/BlockedTiles";

/**
 * The tiles that stop a walker standing at `standingAt`: every wall, and every tile on a level the walker cannot step to
 * from where they stand. From a level they can walk onto floor of that level and onto a stair that joins it to another;
 * from a stair, onto floor of either level it joins. A drop between two levels is a wall to the one below and to the one above,
 * and a stair is the only way across it.
 */
export function blockedFrom(arena: Arena, standingAt: Point): BlockedTiles {
  const levels = levelsReachableFrom(arena, standingAt);

  return (tileX, tileY) => {
    if (isSolid(arena, tileX, tileY)) {
      return true;
    }

    const level = levelOfTile(arena, tileX, tileY);
    if (stairOfTile(arena, tileX, tileY) !== undefined) {
      return !levels.includes(level) && !levels.includes(level + 1);
    }

    return !levels.includes(level);
  };
}

/** The levels a walker at `point` can step onto: their own, and on a stair the other end's too. */
function levelsReachableFrom(arena: Arena, point: Point): readonly number[] {
  const tileX = Math.floor(point.x);
  const tileY = Math.floor(point.y);
  const level = levelOfTile(arena, tileX, tileY);

  if (stairOfTile(arena, tileX, tileY) === undefined) {
    return [level];
  }

  return [level, level + 1];
}
