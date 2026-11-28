/** How a sparring match or a duel with a ring is opened: the seed that picks the ring's centre and the ring's two timings, in seconds. */
export interface ClosingRingRequest {
  seed: number;
  delaySeconds: number;
  closingSeconds: number;
  /** How many times the normal ring damage; absent means the normal damage. A stronger ring decides a round sooner and closes no faster. */
  damageScale?: number;
}
