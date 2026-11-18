import type {WeaponEvalInput} from "@evals/dsl/weapon/pipeline/types/WeaponEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

/** A pure, deterministic check of one property of a weapon outcome. */
export type WeaponEvaluator = (input: WeaponEvalInput) => EvalScore;
