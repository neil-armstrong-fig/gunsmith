import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Whether no wall stands on the straight line from `from` to `to`, found the way a bullet finds one: by sampling the
 * line often enough that a one-tile wall cannot be jumped. A target standing inside a wall is not in clear sight.
 */
export function hasClearLine(arena: Arena, from: Point, to: Point): boolean {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) {
    return true;
  }

  const direction = {x: (to.x - from.x) / length, y: (to.y - from.y) / length};

  return distanceToWall(arena, {position: from, direction}, length) === undefined;
}
