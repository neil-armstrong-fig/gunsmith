import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";
import {isInCone} from "@gunsmith/engine/vision/cone/IsInCone";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/** Whether the fighter whose cone this is sees `point`: it is inside the cone and nothing stands between that hides it, a wall or ground higher than the fighter's eye level. */
export function canSeePoint(arena: Arena, cone: Cone, point: Point): boolean {
  if (!isInCone(cone, point)) {
    return false;
  }

  return hasClearLine(blocksSightFrom(arena, cone.eyeLevel), cone.apex, point);
}
