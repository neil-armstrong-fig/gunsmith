import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

/**
 * Runs checks over one trial's answer and says, in one sentence each, which failed and why (`withinCaps: 2000 damage per second is
 * over 150`), or nothing when every check held. A trial holds one answer; that a criterion held in every trial (pass^k) is the
 * mapping's, because each trial is its own scope.
 */
export function failuresOf<Input>(input: Input, checks: Array<(input: Input) => EvalScore>): string[] {
  return checks
    .map(check => check(input))
    .filter(score => score.score === 0)
    .map(score => {
      if (!score.comment) {
        return score.key;
      }

      return `${score.key}: ${score.comment}`;
    });
}
