/**
 * How the day's set of arenas is made up: `size` arenas, of which up to `mostPlayed` are yesterday's most played and the rest are
 * drawn, an arena played in the last `recentDays` days being less likely to be drawn. Tunables for play.
 */
export const ARENA_ROTATION = {
  /** How many built-in arenas are offered each day. */
  size: 5,
  /** How many of yesterday's most played arenas stay, at most: an arena nobody played yesterday is never kept. */
  mostPlayed: 2,
  /** An arena played within this many days before the day counts as recently played, and is less likely to be drawn. */
  recentDays: 7,
} as const;
