import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {walkingRoutesFrom} from "@gunsmith/engine/route/WalkingRoutesFrom";

/**
 * The middle of every tile a walker standing at `start` can walk to, the tile they stand on included, in the order a
 * flood fill finds them. A step from tile to tile is allowed when the walker, standing on the tile they leave, is not
 * blocked from the next (`blockedFrom`), so a wall stops them and a drop between levels does too, and only a stair gets
 * them across it, in either direction.
 */
export function tilesReachableFrom(arena: Arena, start: Point): readonly Point[] {
  return [...walkingRoutesFrom(arena, start).values()].map(step => {
    return step.tile;
  });
}
