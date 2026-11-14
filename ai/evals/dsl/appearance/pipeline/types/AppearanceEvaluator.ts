import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

/** A pure, deterministic check of one property of an appearance outcome. */
export type AppearanceEvaluator = (input: AppearanceEvalInput) => EvalScore;
