/** The three things the evals ask about, each with its own DSL, driver and trial count. */
export const evalDomains = ["weapon", "appearance", "arena"] as const;
export type EvalDomain = (typeof evalDomains)[number];
