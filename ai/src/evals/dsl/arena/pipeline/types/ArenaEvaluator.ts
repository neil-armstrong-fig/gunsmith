import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

/** A pure, deterministic check of one property of an arena outcome. */
export type ArenaEvaluator = (input: ArenaEvalInput) => EvalScore;
