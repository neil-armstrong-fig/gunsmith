import type {WeaponEvalCase} from "@evals/types/WeaponEvalCase";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** What a test changes about the default passing input. */
export interface EvalInputOverrides {
  evalCase?: Partial<WeaponEvalCase>;
  outcome?: Partial<WeaponOutcome>;
}
