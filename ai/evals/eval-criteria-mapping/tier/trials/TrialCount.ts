import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

const LOCAL_TRIALS = 3;

/**
 * How many times each case runs. The local tier is free but not fully repeatable, so it runs three; the fake tier is
 * deterministic and the paid tier costs money, so each runs once. `EVAL_TRIALS` overrides with a positive whole number.
 */
export function trialCount(tier: EvalTier, requested: string | undefined): number {
  const count = Number(requested);
  if (requested !== undefined && Number.isInteger(count) && count > 0) {
    return count;
  }

  if (tier === "local") {
    return LOCAL_TRIALS;
  }

  return 1;
}
