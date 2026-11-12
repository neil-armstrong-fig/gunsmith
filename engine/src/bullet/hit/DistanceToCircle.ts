import type {Circle} from "@gunsmith/engine/geometry/types/Circle";
import type {Ray} from "@gunsmith/engine/geometry/types/Ray";

/**
 * How far along a ray it first touches a circle: zero when it starts
 * inside, `undefined` when it never does. Worked out exactly, not by sampling, so a shot that only grazes the edge (a
 * chord shorter than any sensible sampling gap) is hit or missed by where the circle is, not by where samples fall.
 */
export function distanceToCircle(ray: Ray, circle: Circle): number | undefined {
  const {position: from, direction} = ray;
  const {centre, radius} = circle;
  const toCentreX = centre.x - from.x;
  const toCentreY = centre.y - from.y;
  const squaredGap = toCentreX * toCentreX + toCentreY * toCentreY;
  if (squaredGap <= radius * radius) {
    return 0;
  }

  const alongRay = toCentreX * direction.x + toCentreY * direction.y;
  if (alongRay < 0) {
    return undefined;
  }

  const squaredMiss = squaredGap - alongRay * alongRay;
  const squaredHalfChord = radius * radius - squaredMiss;
  if (squaredHalfChord < 0) {
    return undefined;
  }

  return alongRay - Math.sqrt(squaredHalfChord);
}
