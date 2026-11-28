/** How many times an arena was played on one day, as the server counted it. */
export interface ArenaPlays {
  /** The arena's name, as in `BUILT_IN_ARENAS`. */
  arena: string;
  /** The day, as a whole number of days since 1 January 1970 UTC: the caller works it out, so the rule reads no clock. */
  day: number;
  count: number;
}
