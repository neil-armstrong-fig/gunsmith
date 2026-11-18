import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "screeningModelCallBudget";

/** At most one moderation call for each prompt, and none for a built-in arena or for a prompt the pre-check turns away. */
export function screeningModelCallBudget({submissions, screening}: ArenaSubmissionEvalInput): EvalScore {
  const prompts = submissions.filter(submission => submission.kind === "prompt").length;
  if (screening.modelCalls <= prompts) {
    return {key: KEY, score: 1};
  }

  return {
    key: KEY,
    score: 0,
    comment: `${screening.modelCalls} model calls, allowed ${prompts} (one moderation for each of ${prompts} prompts, none for a built-in arena)`,
  };
}
