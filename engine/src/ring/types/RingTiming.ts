/**
 * How a round's ring runs: when it starts and how long it takes to close, both in seconds of the round played, and how hard it
 * hurts. Tunables, set by play.
 */
export interface RingTiming {
  /** How long the round is fought before the ring starts to close. */
  startDelaySeconds: number;
  /** How long the ring then takes to close from covering the arena down to its final size; it hurts for as long as the round goes on. */
  closingSeconds: number;
  /** How many times the normal damage it does, as a multiple of the normal rate; absent means 1. A stronger ring decides a round sooner and closes no faster. */
  damageScale?: number | undefined;
}
