import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";
import type {WalkStep} from "@gunsmith/engine/route/types/WalkStep";
import {walkingRoutesFrom} from "@gunsmith/engine/route/WalkingRoutesFrom";

/**
 * The shortest way on foot from the tile `from` stands on to the tile `to` stands on, as the middle of every tile along it,
 * both ends included; `undefined` when there is none (a wall, a platform with no stair to it). It follows the way back along
 * `walkingRoutesFrom`, so it walks on the same terms as `tilesReachableFrom`, and ties go the same way each time. It keeps
 * nothing between calls.
 */
export function tilePathBetween(arena: Arena, from: Point, to: Point): readonly Point[] | undefined {
  const routes = walkingRoutesFrom(arena, from);
  const last = routes.get(tileKeyOf(to));
  if (!last) {
    return undefined;
  }

  return pathBackFrom(routes, last);
}

function pathBackFrom(routes: ReadonlyMap<string, WalkStep>, last: WalkStep): readonly Point[] {
  const path: Point[] = [last.tile];
  let previous = last.cameFrom && routes.get(tileKeyOf(last.cameFrom));
  while (previous) {
    path.unshift(previous.tile);
    previous = previous.cameFrom && routes.get(tileKeyOf(previous.cameFrom));
  }

  return path;
}
