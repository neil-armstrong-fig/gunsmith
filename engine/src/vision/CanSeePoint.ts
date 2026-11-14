import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hasClearLine} from "@gunsmith/engine/vision/HasClearLine";
import {isInCone} from "@gunsmith/engine/vision/cone/IsInCone";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/** Whether the fighter whose cone this is sees `point`: it is inside the cone and no wall stands between. */
export function canSeePoint(arena: Arena, cone: Cone, point: Point): boolean {
  if (!isInCone(cone, point)) {
    return false;
  }

  return hasClearLine(arena, cone.apex, point);
}
