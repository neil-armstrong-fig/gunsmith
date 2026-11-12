import type {WeaponEvalCase} from "@evals/types/WeaponEvalCase";
import type {WeaponOutcome} from "@src/pipeline/types/WeaponOutcome";

export interface EvalInput {
  evalCase: WeaponEvalCase;
  outcome: WeaponOutcome;
}
