import type {EvalInputOverrides} from "@evals/evaluators/types/EvalInputOverrides";
import type {EvalInput} from "@evals/types/EvalInput";

/** A passing weapon case by default; a test overrides only what it is about. */
export function evalInput(overrides: EvalInputOverrides = {}): EvalInput {
  return {
    evalCase: {
      name: "a mild rifle",
      kind: "positive",
      suite: "regression",
      prompt: "a mild rifle",
      expectation: "created",
      maxModelCalls: 3,
      ...overrides.evalCase,
    },
    outcome: {
      status: "created",
      weapon: {name: "Proof Rifle", damage: 20, rateOfFire: 6},
      nodes: ["precheck", "moderation", "generate"],
      modelCalls: 2,
      ...overrides.outcome,
    },
  };
}
