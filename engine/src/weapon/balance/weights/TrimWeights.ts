/**
 * How hard a stat is trimmed when a weapon is over its limits, as a multiple of the even trim: a stat the player favours gives up a
 * quarter as much and one they would sacrifice three times as much. Tunables, set by play.
 */
export const TRIM_WEIGHTS = {favoured: 0.25, neutral: 1, sacrificed: 3} as const;
