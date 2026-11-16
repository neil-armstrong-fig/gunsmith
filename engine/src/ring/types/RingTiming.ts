/** When a round's ring starts and how long it takes to close, both in seconds of the round played. Tunables, set by play. */
export interface RingTiming {
  /** How long the round is fought before the ring starts to close. */
  startDelaySeconds: number;
  /** How long the ring then takes to close from covering the arena down to its final size; it hurts for as long as the round goes on. */
  closingSeconds: number;
}
