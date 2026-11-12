import type {WeaponEvalCase} from "@evals/types/WeaponEvalCase";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** What an evaluator is given: the case, and what the pipeline answered. */
export interface EvalInput {
  evalCase: WeaponEvalCase;
  outcome: WeaponOutcome;
}
