import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

const LOCAL_TRIALS = 3;

/**
 * How many times each case runs. The local tier is free but not fully repeatable, so it runs three; the fake tier is
 * deterministic and the paid tier costs money, so each runs once. A slow case passes its own local default (`localTrials`) so
 * the whole local run stays short. `EVAL_TRIALS` overrides with a positive whole number.
 */
export function trialCount(tier: EvalTier, requested: string | undefined, localTrials: number = LOCAL_TRIALS): number {
  const count = Number(requested);
  if (requested !== undefined && Number.isInteger(count) && count > 0) {
    return count;
  }

  if (tier === "local") {
    return localTrials;
  }

  return 1;
}
