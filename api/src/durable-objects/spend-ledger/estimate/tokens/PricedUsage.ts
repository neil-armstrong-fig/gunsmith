import type {ModelUsage} from "@gunsmith/ai/pipeline/types/ModelUsage";

const TOKENS_PER_MILLION = 1_000_000;

/**
 * Haiku 5.5's prices in microdollars a million tokens: $0.10 in and $0.50 out (`docs/cost-and-budget.md`). The one model every call
 * uses for now (the user, 2026-11-16); change them with the model. A cache hit is cheaper, so pricing it as a plain input token
 * overcounts, the safe side for a cap.
 */
const INPUT_MICRODOLLARS_PER_MILLION = 100_000;
const OUTPUT_MICRODOLLARS_PER_MILLION = 500_000;

/**
 * What the tokens a request's models reported came to, in whole microdollars, rounded up so the meter never undercounts. `undefined`
 * when nothing usable was reported (no usage, all zero, or a count that is negative or not finite), so the caller prices the calls
 * instead: a model that reported nothing was not free.
 */
export function pricedUsage(usage: ModelUsage | undefined): number | undefined {
  if (!usage) {
    return undefined;
  }

  const {inputTokens, outputTokens} = usage;
  if (!isCount(inputTokens) || !isCount(outputTokens)) {
    return undefined;
  }

  if (inputTokens + outputTokens === 0) {
    return undefined;
  }

  const total = inputTokens * INPUT_MICRODOLLARS_PER_MILLION + outputTokens * OUTPUT_MICRODOLLARS_PER_MILLION;
  return Math.ceil(total / TOKENS_PER_MILLION);
}

function isCount(tokens: number): boolean {
  return Number.isFinite(tokens) && tokens >= 0;
}
