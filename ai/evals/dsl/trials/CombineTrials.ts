import type {EvalScore} from "@evals/dsl/types/EvalScore";

/**
 * Folds the scores of several trials of one case into one set (pass^k): an evaluator passes only if it passed in every trial.
 * A local model is not fully repeatable, so one lucky run is not a pass; Anthropic's example is that 75% a trial over three
 * trials is only about 42% for all three.
 */
export function combineTrials(trials: EvalScore[][]): EvalScore[] {
  const first = trials[0];
  if (!first) {
    return [];
  }

  return first.map(({key}) => combineOne(key, trials));
}

function combineOne(key: string, trials: EvalScore[][]): EvalScore {
  const scores = trials.flatMap(trial => trial.filter(score => score.key === key));
  const failures = scores.filter(score => score.score === 0);
  const firstFailure = failures[0];
  if (!firstFailure) {
    return {key, score: 1};
  }

  const summary = `failed in ${failures.length} of ${scores.length} trials`;
  if (!firstFailure.comment) {
    return {key, score: 0, comment: summary};
  }

  return {key, score: 0, comment: `${summary}: ${firstFailure.comment}`};
}
