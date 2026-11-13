/** The sixteenth-note steps of a bar, 0 to 15, on which the bass plays. */
export const BASS_PATTERNS = {
  /** Eight stabs pushing the bar along. */
  driving: [0, 2, 3, 6, 8, 10, 11, 14],
  /** Seven, shifted off the beat: the same pulse answered a little late. */
  syncopated: [0, 3, 5, 8, 10, 13, 14],
  /** Three long notes, for a section that holds back. */
  sparse: [0, 3, 6],
} as const;
