import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {outsideRing} from "@gunsmith/engine/ring/damage/over/OutsideRing";
import {ringDamageRate} from "@gunsmith/engine/ring/damage/RingDamageRate";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/** The health a fighter standing at `point` loses to the ring over `seconds`, at the rate the ring has now: nothing inside it. */
export function ringDamageOver(ring: Ring, point: Point, seconds: number): number {
  if (!outsideRing(ring, point)) {
    return 0;
  }

  return ringDamageRate(ring) * seconds;
}
