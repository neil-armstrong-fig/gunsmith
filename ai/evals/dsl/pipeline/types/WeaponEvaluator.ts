import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/pipeline/types/EvalScore";

/** A pure, deterministic check of one property of a weapon outcome. */
export type WeaponEvaluator = (input: EvalInput) => EvalScore;
