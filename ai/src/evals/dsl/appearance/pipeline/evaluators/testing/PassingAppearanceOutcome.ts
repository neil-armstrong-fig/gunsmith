import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/** An outcome that was valid on the first answer, after one call, with a drawing that passes every rule. Test-only. */
export function passingAppearanceOutcome(overrides: Partial<AppearanceOutcome> = {}): AppearanceOutcome {
  return {
    status: "valid",
    appearance: passingAppearance(),
    changes: [],
    errors: [],
    nodes: ["generate", "fix", "validate"],
    modelCalls: 1,
    usage: {inputTokens: 100, outputTokens: 200},
    ...overrides,
  };
}
