import fc from "fast-check";
import type {ModelUsage} from "@gunsmith/ai/pipeline/shared/usage/types/ModelUsage";

/** What a request's models reported: nothing, all zero, or tokens in the range a weapon or arena request really uses (about 1,000 to 7,000 in, up to 2,000 out). */
export function reportedUsages(): fc.Arbitrary<ModelUsage | undefined> {
  return fc.oneof(
    fc.constant(undefined),
    fc.constant<ModelUsage>({inputTokens: 0, outputTokens: 0}),
    fc.record({inputTokens: fc.integer({min: 1_000, max: 7_000}), outputTokens: fc.integer({min: 0, max: 2_000})}),
  );
}
