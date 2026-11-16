import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {radiusOfRing} from "@gunsmith/engine/ring/RadiusOfRing";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/** Whether `point` is beyond the ring's edge. The edge itself is safe ground. */
export function outsideRing(ring: Ring, point: Point): boolean {
  return Math.hypot(point.x - ring.centre.x, point.y - ring.centre.y) > radiusOfRing(ring);
}
