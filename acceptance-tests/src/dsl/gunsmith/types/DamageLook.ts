/** What a player sees of damage round the player's body, counted as places on the screen that show the coral of damage. */
export interface DamageLook {
  /** Places on the bracket that stands to the left of the body. */
  leftBracketPoints: number;
  /** Places on the bracket that stands to the right of the body. */
  rightBracketPoints: number;
  /** Places on the red highlight drawn round the body while the ring hurts. */
  highlightPoints: number;
  /** How far out from the body's centre, in the art study's pixels, the left bracket's bar shows (25 where it stands, up to 33 once it has opened), or 0 when it shows nowhere. */
  leftBracketReachPixels: number;
}
