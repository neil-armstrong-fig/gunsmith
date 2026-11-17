import {hasStairs} from "@gunsmith/engine/arena/HasStairs";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {canWalkTo} from "@gunsmith/engine/opponent/state/acting/walkable/CanWalkTo";
import {tilePathBetween} from "@gunsmith/engine/route/TilePathBetween";

/**
 * How far the opponent has to walk to get from `from` to `to`, or `undefined` when it cannot set out (`canWalkTo`). With no stair
 * in the arena it walks in a straight line, so that is the distance; with a stair the way may wind round a drop, so it is the
 * number of tiles on the shortest walk (`tilePathBetween`), and a place just across a drop is far while the stair is far.
 */
export function walkingDistanceTo(arena: Arena, from: Point, to: Point): number | undefined {
  if (!canWalkTo(arena, from, to)) {
    return undefined;
  }

  if (!hasStairs(arena)) {
    return Math.hypot(to.x - from.x, to.y - from.y);
  }

  return tilePathBetween(arena, from, to)?.length;
}
