/**
 * How many times each case runs: what `EVAL_TRIALS` says when it is a positive whole number, otherwise its tier's own default,
 * which the tier's driver passes in (the local tier is free but not fully repeatable, so it runs several; the fake tier is
 * deterministic and the paid tier costs money, so each runs once; a slow case keeps the local run short with a default of one).
 */
export function trialCount(requested: string | undefined, defaultTrials: number): number {
  const count = Number(requested);
  if (requested !== undefined && Number.isInteger(count) && count > 0) {
    return count;
  }

  return defaultTrials;
}
