import type {ModelUsage} from "@gunsmith/ai/pipeline/shared/usage/types/ModelUsage";

// Haiku 5.5 list price, dollars per million tokens (`docs/cost-and-budget.md`, from the pricing page, 2026-11-12). Our own
// estimate from the tokens the model reports, so the Console's usage page is the bill and this is only the guard.
const INPUT_DOLLARS_PER_MILLION_TOKENS = 0.1;
const OUTPUT_DOLLARS_PER_MILLION_TOKENS = 0.5;

/** What one Haiku call cost, in dollars, from the tokens the model reported. */
export function haikuCost(usage: ModelUsage): number {
  const inputDollars = (usage.inputTokens * INPUT_DOLLARS_PER_MILLION_TOKENS) / 1_000_000;
  const outputDollars = (usage.outputTokens * OUTPUT_DOLLARS_PER_MILLION_TOKENS) / 1_000_000;

  return inputDollars + outputDollars;
}
