/** How hard the opponent is to beat. Every number is a tunable, to be set by play. */
export interface Difficulty {
  /** How long after it sights the player before it opens fire. */
  reactionSeconds: number;
  /** How many shots a burst holds, so a burst lasts as long as the weapon in hand takes to fire them. */
  burstShots: number;
  /** How long it rests between bursts. */
  restSeconds: number;
  /** The widest a burst can miss by, in radians, when it has only just seen the player. */
  widestAimError: number;
  /** The widest a burst can miss by once it has had the player in sight for `aimSettleSeconds`. */
  narrowestAimError: number;
  /** How long in sight it takes the aim error to settle from the widest to the narrowest. */
  aimSettleSeconds: number;
  /** It closes in on the player when farther than this, in tiles. */
  farRange: number;
  /** It backs away from the player when nearer than this, in tiles. */
  nearRange: number;
  /** What share of a player's walking speed it walks at. */
  speedShare: number;
  /** The shortest time it holds one side while circling the player. */
  strafeMinSeconds: number;
  /** The longest time it holds one side while circling the player. */
  strafeMaxSeconds: number;
  /** How long it walks to one wander goal before choosing another. */
  wanderRepickSeconds: number;
  /** The nearest a wander goal can be, in tiles, so it goes somewhere rather than shuffling. */
  wanderMinDistance: number;
  /** How long it waits at the last place it saw the player before giving up. */
  searchLingerSeconds: number;
  /** How long it walks before checking it has got somewhere. */
  stuckSeconds: number;
  /** Walking less than this far in that time counts as stuck, in tiles. */
  stuckDistance: number;
  /** Closer to its goal than this, in tiles, it has arrived. */
  arrivalRadius: number;
  /** How many places it tries as cover when it reloads. */
  coverSamples: number;
  /** How far from itself it looks for cover, in tiles. */
  coverReach: number;
  /** Once the ring is closing it keeps this far inside its edge, in tiles, so the edge never reaches it. */
  ringMargin: number;
}
