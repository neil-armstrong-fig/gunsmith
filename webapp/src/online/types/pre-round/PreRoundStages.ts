/** The stages of the choosing in order, as the server names them: choose (weapon 1, weapon 2, an arena), pick between the arenas when they differ, decided, and the reveal of what was decided before the match begins. */
export const PRE_ROUND_STAGES = ["choosing", "picking", "decided", "revealing"] as const;
