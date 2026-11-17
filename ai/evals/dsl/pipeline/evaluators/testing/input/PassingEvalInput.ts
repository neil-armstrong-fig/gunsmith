import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";
import {PASSING_WEAPON} from "@evals/dsl/pipeline/evaluators/testing/weapon/PassingWeapon";
import type {EvalInputOverrides} from "@evals/dsl/pipeline/evaluators/testing/input/types/EvalInputOverrides";
import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";

/** A passing weapon outcome by default, drawn on its first answer; a test overrides only what it is about. */
export function passingEvalInput(overrides: EvalInputOverrides = {}): EvalInput {
  return {
    outcome: {
      status: "created",
      weapon: PASSING_WEAPON,
      appearance: passingAppearanceOutcome(),
      nodes: [
        "precheck",
        "moderation",
        "generate",
        "validate",
        "balance",
        "rate",
        "appearance.generate",
        "appearance.fix",
        "appearance.validate",
      ],
      modelCalls: 3,
      ...overrides.outcome,
    },
  };
}
