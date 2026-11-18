import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";
import {PASSING_WEAPON} from "@evals/dsl/weapon/pipeline/evaluators/testing/weapon/PassingWeapon";
import type {WeaponEvalInputOverrides} from "@evals/dsl/weapon/pipeline/evaluators/testing/input/types/WeaponEvalInputOverrides";
import type {WeaponEvalInput} from "@evals/dsl/weapon/pipeline/types/WeaponEvalInput";

/** A passing weapon outcome by default, drawn on its first answer; a test overrides only what it is about. */
export function passingWeaponEvalInput(overrides: WeaponEvalInputOverrides = {}): WeaponEvalInput {
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
