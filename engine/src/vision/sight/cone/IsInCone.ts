import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/** A point exactly on the edge is inside; this keeps rounding in the cosine from putting it out. */
const EDGE_TOLERANCE = 1e-9;

/**
 * Whether `point` lies inside the cone, walls aside: no farther than its range and no more than its half angle from the
 * aim. The angle is compared through the cosine (the dot product of the aim and the way to the point), so there is no
 * `atan2` to wrap at the half turn. The apex itself is inside.
 */
export function isInCone(cone: Cone, point: Point): boolean {
  const dx = point.x - cone.apex.x;
  const dy = point.y - cone.apex.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return true;
  }

  if (distance > cone.range) {
    return false;
  }

  const alongAim = dx * cone.aim.x + dy * cone.aim.y;

  return alongAim >= distance * Math.cos(cone.halfAngleRadians) - EDGE_TOLERANCE;
}
