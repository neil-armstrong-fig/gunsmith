import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {pushOnce} from "@gunsmith/engine/movement/pushing/PushOnce";

/** Resolving one wall can push a circle into a neighbour, so a few passes settle it; more is never needed at game speeds. */
const PASSES = 4;

/**
 * Moves a circle out of every blocked tile it overlaps (`blocked`: a wall, or a drop it cannot walk up), along the line from the wall's nearest point to the circle's centre.
 * Pushing along that line is what lets a player slide along a wall rather than stick to it.
 *
 * It resolves overlap, it does not sweep: a circle that travels further than its radius in one step can tunnel through
 * a wall, so the caller steps in small, fixed increments.
 */
export function pushOutOfWalls(blocked: BlockedTiles, centre: Point, radius: number): Point {
  let position = centre;

  for (let pass = 0; pass < PASSES; pass += 1) {
    const pushed = pushOnce(blocked, position, radius);
    if (pushed === position) {
      return position;
    }

    position = pushed;
  }

  return position;
}
