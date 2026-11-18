import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import type {StepReport} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/types/StepReport";

/**
 * Where the dummies that lost health in the step stood (a dummy that lost all of it is gone from `after`, so it is looked for in `before`), leaving out any the
 * player does not see as the step leaves them: the step's events say only that a bullet hit some dummy in sight, so a dummy hurt out of sight in the same step must
 * not be marked. Dummies stand still, so a dummy is the one at the same place.
 */
export function hurtDummiesInSight({before, after}: StepReport): Point[] {
  const cone = coneOf(after.arena, after.player);

  return before.dummies
    .filter(dummy => {
      const left = after.dummies.find(
        standing => standing.position.x === dummy.position.x && standing.position.y === dummy.position.y,
      );

      return left === undefined || left.health < dummy.health;
    })
    .map(dummy => dummy.position)
    .filter(place => canSeePoint(after.arena, cone, place));
}
