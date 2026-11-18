import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";

/** What an arena-submission evaluator is given: what the players put forward in one run, and what screening left them. */
export interface ArenaSubmissionEvalInput {
  submissions: readonly ArenaSubmission[];
  screening: ArenaSubmissionScreening;
}
