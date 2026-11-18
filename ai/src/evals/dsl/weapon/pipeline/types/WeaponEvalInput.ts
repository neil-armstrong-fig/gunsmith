import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** What an evaluator is given: what the pipeline answered to one trial. */
export interface WeaponEvalInput {
  outcome: WeaponOutcome;
}
