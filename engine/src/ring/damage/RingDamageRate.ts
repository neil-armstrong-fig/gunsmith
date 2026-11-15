import {closingProgress} from "@gunsmith/engine/ring/ClosingProgress";
import {MAXIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MaximumRingDamage";
import {MINIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MinimumRingDamage";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/**
 * The health a fighter outside the ring loses each second right now: nothing until the ring starts to close, then a
 * straight line from the minimum up to the maximum over the closing time, and the maximum from then on, so a round the ring
 * is deciding always ends.
 */
export function ringDamageRate(ring: Ring): number {
  const progress = closingProgress(ring);
  if (progress <= 0) {
    return 0;
  }

  return MINIMUM_RING_DAMAGE_PER_SECOND + (MAXIMUM_RING_DAMAGE_PER_SECOND - MINIMUM_RING_DAMAGE_PER_SECOND) * progress;
}
