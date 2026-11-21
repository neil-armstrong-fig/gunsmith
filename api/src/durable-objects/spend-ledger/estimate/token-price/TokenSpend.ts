import type {ModelUsage} from "@gunsmith/ai/pipeline/types/ModelUsage";

// Haiku 5.5 list price in microdollars a token ($0.10 and $0.50 a million; `docs/cost-and-budget.md`, from the pricing page). Our own
// figure from the tokens the models report, so the Console's usage page is the bill and this only guards the caps.
const INPUT_MICRODOLLARS_PER_TOKEN = 0.1;
const OUTPUT_MICRODOLLARS_PER_TOKEN = 0.5;

/**
 * What the tokens a request's models reported cost, in whole microdollars (a fraction rounds up, so settling never undercounts), or
 * `undefined` when they reported none, so the caller prices its calls instead.
 */
export function tokenSpend(usage: ModelUsage | undefined): number | undefined {
  if (!usage) {
    return undefined;
  }

  if (usage.inputTokens === 0 && usage.outputTokens === 0) {
    return undefined;
  }

  return Math.ceil(
    usage.inputTokens * INPUT_MICRODOLLARS_PER_TOKEN + usage.outputTokens * OUTPUT_MICRODOLLARS_PER_TOKEN,
  );
}
