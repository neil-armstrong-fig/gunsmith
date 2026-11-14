/** What the burst clock needs to know about the step: how fast the weapon in hand fires, and how long the step is. */
export interface BurstRequest {
  fireIntervalSeconds: number;
  seconds: number;
}
