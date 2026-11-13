/** The beats of a bar, 0 to 3, on which the kick plays. */
export const KICK_PATTERNS = {
  everyBeat: [0, 1, 2, 3],
  /** On the first and third beats: half the weight. */
  halves: [0, 2],
  /** On the first beat only. */
  downbeat: [0],
} as const;
