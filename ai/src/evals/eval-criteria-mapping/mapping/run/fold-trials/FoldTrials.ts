import type {CriterionResult} from "@evals/eval-criteria-mapping/environment/reporting/types/CriterionResult";

/**
 * Folds the rows a criterion wrote in each trial's scope into one row (pass^k: it holds only if it held in every trial), as the
 * results of a run are read: one row per `then`. A criterion that failed says in how many trials and why in the first, as the
 * report has always put it (`failed in 2 of 3 trials: …`). A criterion with one row is left as it is, so a run of one trial reads
 * as it always did.
 */
export function foldTrials(results: CriterionResult[]): CriterionResult[] {
  const groups = new Map<string, CriterionResult[]>();
  for (const result of results) {
    const key = JSON.stringify([result.given, result.when, result.then]);
    groups.set(key, [...(groups.get(key) ?? []), result]);
  }

  return [...groups.values()].flatMap(foldOne);
}

/** One row for a criterion's trials: none if it has none (it always has one). */
function foldOne(trials: CriterionResult[]): CriterionResult[] {
  const [first] = trials;
  if (!first || trials.length === 1) {
    return trials;
  }

  const failures = trials.filter(trial => !trial.passed);
  const firstFailure = failures[0];
  if (!firstFailure) {
    return [first];
  }

  const summary = `failed in ${failures.length} of ${trials.length} trials`;
  if (!firstFailure.comment) {
    return [{...first, passed: false, comment: summary}];
  }

  return [{...first, passed: false, comment: `${summary}: ${firstFailure.comment}`}];
}
