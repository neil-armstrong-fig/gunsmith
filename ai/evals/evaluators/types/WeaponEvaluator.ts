import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";

/** A pure, deterministic check of one property of a weapon outcome. */
export type WeaponEvaluator = (input: EvalInput) => EvalScore;
