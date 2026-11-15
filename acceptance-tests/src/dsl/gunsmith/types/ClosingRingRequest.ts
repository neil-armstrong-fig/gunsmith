/** How a sparring match with a ring is opened: the seed that picks the ring's centre and the ring's two timings, in seconds. */
export interface ClosingRingRequest {
  seed: number;
  delaySeconds: number;
  closingSeconds: number;
}
