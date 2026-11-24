/**
 * The stages of the pre-round in order: each seat chooses (weapon 1, weapon 2, an arena), then (only if the arenas differ) each picks one,
 * then it is decided, and the seats are shown what was settled (`revealing`) before the match begins. A room allowed no reveal time goes
 * from deciding straight to the match, so a seat sees `decided` for no longer than one tick.
 */
export const PRE_ROUND_STAGES = ["choosing", "picking", "decided", "revealing"] as const;
