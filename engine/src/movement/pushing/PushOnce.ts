import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {pushFromTile} from "@gunsmith/engine/movement/pushing/tile/PushFromTile";

/**
 * One pass over every tile the circle could touch: each blocked one pushes it clear of itself, judged from where the
 * circle has been moved to so far. Returns `centre` itself, not a copy, when nothing moved it, so a caller can tell.
 */
export function pushOnce(blocked: BlockedTiles, centre: Point, radius: number): Point {
  let x = centre.x;
  let y = centre.y;
  let moved = false;

  for (let tileY = Math.floor(y - radius); tileY <= Math.floor(y + radius); tileY += 1) {
    for (let tileX = Math.floor(x - radius); tileX <= Math.floor(x + radius); tileX += 1) {
      if (!blocked(tileX, tileY)) {
        continue;
      }

      const push = pushFromTile({x, y}, {x: tileX, y: tileY}, radius);
      if (push) {
        x += push.x;
        y += push.y;
        moved = true;
      }
    }
  }

  if (!moved) {
    return centre;
  }

  return {x, y};
}
