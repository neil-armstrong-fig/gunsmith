import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/** The ring after `seconds` more of the round have been played. */
export function advanceRing(ring: Ring, seconds: number): Ring {
  return {...ring, roundSeconds: ring.roundSeconds + seconds};
}
