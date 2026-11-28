/** How late a connection delivers each frame, each way. Jitter makes the delay vary from frame to frame, in a fixed pattern. */
export interface ConnectionDelay {
  milliseconds: number;
  /** Up to this much more on top of `milliseconds`, in a repeating pattern (never random, so a failing run can be replayed). Absent means none. */
  jitterMilliseconds?: number;
}
