import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

/** A pure, deterministic check of one property of one run of arena-submission screening. */
export type ArenaSubmissionEvaluator = (input: ArenaSubmissionEvalInput) => EvalScore;
