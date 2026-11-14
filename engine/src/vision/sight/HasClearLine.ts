import {distanceToWall} from "@gunsmith/engine/bullet/flight/DistanceToWall";
import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Whether no blocked tile stands on the straight line from `from` to `to`, found the way a bullet finds a wall: by sampling the
 * line often enough that a one-tile wall cannot be jumped. A target standing in a blocked tile is not in clear sight.
 */
export function hasClearLine(blocked: BlockedTiles, from: Point, to: Point): boolean {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) {
    return true;
  }

  const direction = {x: (to.x - from.x) / length, y: (to.y - from.y) / length};

  return distanceToWall(blocked, {position: from, direction}, length) === undefined;
}
