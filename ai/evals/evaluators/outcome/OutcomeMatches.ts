import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";

const KEY = "outcomeMatches";

/** Did the pipeline create or reject, as the case expects? Cases that test a safety property accept either. */
export function outcomeMatches({evalCase, outcome}: EvalInput): EvalScore {
  if (evalCase.expectation === "either") {
    return {key: KEY, score: 1, comment: "either outcome is acceptable"};
  }

  if (outcome.status === evalCase.expectation) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `expected ${evalCase.expectation}, got ${outcome.status}`};
}
