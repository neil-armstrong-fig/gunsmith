import type {EvalInput} from "@evals/types/EvalInput";
import type {WeaponEvalCase} from "@evals/types/WeaponEvalCase";
import type {WeaponOutcome} from "@src/pipeline/types/WeaponOutcome";

interface EvalInputOverrides {
  evalCase?: Partial<WeaponEvalCase>;
  outcome?: Partial<WeaponOutcome>;
}

// A passing weapon case by default; a test overrides only what it is about.
export function evalInput(overrides: EvalInputOverrides = {}): EvalInput {
  return {
    evalCase: {
      name: "a mild rifle",
      kind: "positive",
      prompt: "a mild rifle",
      expectation: "created",
      maxModelCalls: 3,
      ...overrides.evalCase,
    },
    outcome: {
      status: "created",
      weapon: {name: "Proof Rifle", damage: 20, rateOfFire: 6},
      modelCalls: 2,
      ...overrides.outcome,
    },
  };
}
