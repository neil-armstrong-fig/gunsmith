import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hasClearSight} from "@gunsmith/engine/vision/sight/HasClearSight";
import {isInCone} from "@gunsmith/engine/vision/sight/cone/IsInCone";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/**
 * Whether the fighter whose cone this is sees `point`: it is inside the cone and nothing stands between that hides it, a wall,
 * raised ground (`hasClearSight`: between two levels only within `EDGE_REACH_TILES` of the higher end), or, if they crouch, a
 * cover block no lower than their eye. A place has no stance;
 * what a crouched fighter standing there is hidden by is `canSeeFighter`'s question.
 */
export function canSeePoint(arena: Arena, cone: Cone, point: Point): boolean {
  if (!isInCone(cone, point)) {
    return false;
  }

  return hasClearSight(arena, {from: cone.apex, eye: cone, to: point});
}
