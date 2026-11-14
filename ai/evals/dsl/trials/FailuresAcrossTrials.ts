import {combineTrials} from "@evals/dsl/trials/CombineTrials";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

/**
 * Runs one check over what every trial answered and folds the verdicts as `combineTrials` does (pass^k: it must hold in every
 * trial). Returns one sentence per way it failed, `key: failed in 2 of 3 trials: why`, or nothing when it held. Both pipelines'
 * `check…` methods are built on it.
 */
export function failuresAcrossTrials<Input>(inputs: Input[], check: (input: Input) => EvalScore): string[] {
  return combineTrials(inputs.map(input => [check(input)]))
    .filter(score => score.score === 0)
    .map(score => `${score.key}: ${score.comment}`);
}
