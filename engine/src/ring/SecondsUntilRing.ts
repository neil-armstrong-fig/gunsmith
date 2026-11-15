import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/** The seconds of the round still to be played before the ring starts to close; nothing once it has started. */
export function secondsUntilRing(ring: Ring): number {
  return Math.max(0, ring.timing.startDelaySeconds - ring.roundSeconds);
}
