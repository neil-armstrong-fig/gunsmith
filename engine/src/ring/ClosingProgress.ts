import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/** How far the ring has closed, from 0 (not started) to 1 (closed): the share of its closing time that has been played. */
export function closingProgress(ring: Ring): number {
  const {startDelaySeconds, closingSeconds} = ring.timing;
  const played = (ring.roundSeconds - startDelaySeconds) / closingSeconds;

  return Math.min(1, Math.max(0, played));
}
