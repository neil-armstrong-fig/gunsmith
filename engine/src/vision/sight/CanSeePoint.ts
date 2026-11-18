import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";
import {isInCone} from "@gunsmith/engine/vision/cone/IsInCone";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/**
 * Whether the fighter whose cone this is sees `point`: it is inside the cone and nothing stands between that hides it, a wall,
 * ground higher than the fighter's eye level, or, if they crouch, a cover block no lower than their eye. A place has no stance;
 * what a crouched fighter standing there is hidden by is `canSeeFighter`'s question.
 */
export function canSeePoint(arena: Arena, cone: Cone, point: Point): boolean {
  if (!isInCone(cone, point)) {
    return false;
  }

  return hasClearLine(blocksSightFrom(arena, cone), cone.apex, point);
}
