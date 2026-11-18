import type {StatusExpectation} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/types/StatusExpectation";
import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "statusMatches";

/** What screening left for the players is what the spec expects. */
export function statusMatches({screening}: ArenaSubmissionEvalInput, expectation: StatusExpectation): EvalScore {
  if (screening.status !== expectation) {
    return {key: KEY, score: 0, comment: `expected the status "${expectation}", but it is "${screening.status}"`};
  }

  return {key: KEY, score: 1};
}
