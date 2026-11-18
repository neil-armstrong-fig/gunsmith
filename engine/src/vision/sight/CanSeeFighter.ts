import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";
import type {SeenFighter} from "@gunsmith/engine/vision/types/SeenFighter";

/**
 * Whether the fighter whose cone this is sees `fighter`: they see the place (`canSeePoint`, where a crouching viewer is stopped
 * by a cover block) and, if `fighter` crouches, no cover block stands right beside them on the line, which hides them from
 * every viewer, one on higher ground too.
 */
export function canSeeFighter(arena: Arena, cone: Cone, fighter: SeenFighter): boolean {
  if (!canSeePoint(arena, cone, fighter.position)) {
    return false;
  }

  if (!fighter.crouching) {
    return true;
  }

  return !coverBesideTarget(arena, cone.apex, fighter.position);
}
