/** What a player sees of damage round the player's body, counted as places on the screen that show the coral of damage. */
export interface DamageLook {
  /** Places on the bracket that stands to the left of the body. */
  leftBracketPoints: number;
  /** Places on the bracket that stands to the right of the body. */
  rightBracketPoints: number;
  /** Places on the red highlight drawn round the body while the ring hurts. */
  highlightPoints: number;
}
