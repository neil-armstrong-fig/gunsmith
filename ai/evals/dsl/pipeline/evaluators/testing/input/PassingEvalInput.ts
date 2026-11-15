import {PASSING_WEAPON} from "@evals/dsl/pipeline/evaluators/testing/weapon/PassingWeapon";
import type {EvalInputOverrides} from "@evals/dsl/pipeline/evaluators/testing/input/types/EvalInputOverrides";
import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";

/** A passing weapon outcome by default; a test overrides only what it is about. */
export function passingEvalInput(overrides: EvalInputOverrides = {}): EvalInput {
  return {
    outcome: {
      status: "created",
      weapon: PASSING_WEAPON,
      nodes: ["precheck", "moderation", "generate", "validate", "balance", "rate"],
      modelCalls: 2,
      ...overrides.outcome,
    },
  };
}
