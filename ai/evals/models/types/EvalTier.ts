/** The model tiers an eval can run on. */
export const evalTiers = ["fake", "local", "paid"] as const;
export type EvalTier = (typeof evalTiers)[number];
