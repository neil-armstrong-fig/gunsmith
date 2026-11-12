export const evalTiers = ["fake", "local", "paid"] as const;
export type EvalTier = (typeof evalTiers)[number];

// `fake` proves the harness runs; `local` (Ollama) is the working loop and costs nothing; `paid` (Haiku) validates a turn
// and is capped. Scores do not transfer between tiers: a local model's pass rate says nothing about Haiku's.
export function parseEvalTier(value: string | undefined): EvalTier {
  const tier = evalTiers.find(candidate => candidate === value);
  if (tier) {
    return tier;
  }

  return "local";
}
