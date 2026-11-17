import {hasStairs} from "@gunsmith/engine/arena/HasStairs";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {tilePathBetween} from "@gunsmith/engine/route/TilePathBetween";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

/**
 * Whether the opponent can set out for `to` from `from`. With no stair in the arena that is what it has always asked: no
 * wall in the straight line, since it walks in a straight line with no map. With a stair a straight line may cross a drop, so
 * the question is whether there is a way on foot at all (`tilePathBetween`), and `routeWaypoint` walks it.
 */
export function canWalkTo(arena: Arena, from: Point, to: Point): boolean {
  if (!hasStairs(arena)) {
    return hasClearLine(solidTilesOf(arena), from, to);
  }

  return tilePathBetween(arena, from, to) !== undefined;
}
