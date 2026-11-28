/** What the player saw of their own shot while `fireAndWatchTheShot` watched it. */
export interface WatchedShot {
  /** Whether a shot was in the air at any of the looks: a shot that never left was stopped before the first. */
  seenInTheAir: boolean;
  /** The farthest west, in tiles, any shot was seen; `undefined` when none was seen. */
  farthestWest: number | undefined;
}
