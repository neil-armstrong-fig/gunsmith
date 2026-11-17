/** What the screen is told about the damage the player takes: the facts a hit leaves, not the match. */
export interface FeedbackCues {
  /** How many steps a bullet has hurt the player in, since the page opened. It only rises: a flash restarts on each change. */
  bulletHits: number;
  /** Whether the ring hurt the player in the latest step of a round being fought. */
  ringHurting: boolean;
}
