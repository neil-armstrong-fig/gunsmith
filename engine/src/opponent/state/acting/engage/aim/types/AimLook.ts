/** What decides how far a burst misses by: how long the player has been in sight, and this burst's roll. */
export interface AimLook {
  /** How long the opponent has had the player in sight without a break. */
  seenSeconds: number;
  /** This burst's error as a share of the widest error, from -1 (right) to 1 (left). */
  roll: number;
}
