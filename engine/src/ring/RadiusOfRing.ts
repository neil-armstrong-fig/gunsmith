import {closingProgress} from "@gunsmith/engine/ring/ClosingProgress";
import {FINAL_RING_RADIUS} from "@gunsmith/engine/ring/radius/FinalRingRadius";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/**
 * How far from the centre the safe ground reaches, in tiles: all of the arena until the ring starts, then a straight line
 * down to the final radius over the closing time, and that radius from then on. It follows from the ring's clock alone, so
 * a round replays exactly. A ring that began smaller than the final radius (a tiny arena) never grows to it.
 */
export function radiusOfRing(ring: Ring): number {
  const finalRadius = Math.min(FINAL_RING_RADIUS, ring.startRadius);

  return ring.startRadius + (finalRadius - ring.startRadius) * closingProgress(ring);
}
