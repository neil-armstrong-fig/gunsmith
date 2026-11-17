import type {CriterionResult} from "@evals/eval-criteria-mapping/reporting/types/CriterionResult";
import type {ResultsRun} from "@evals/eval-criteria-mapping/reporting/types/ResultsRun";
import type {ResultsSummary} from "@evals/eval-criteria-mapping/reporting/types/ResultsSummary";
import type {SuiteTally} from "@evals/eval-criteria-mapping/reporting/types/SuiteTally";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

/** Works out the counts for one spec's run: all its criteria, and each suite on its own. */
export function summariseResults(run: ResultsRun): ResultsSummary {
  return {
    ...run,
    criteria: run.results.length,
    criteriaPassed: run.results.filter(result => result.passed).length,
    regression: tally(run.results, "regression"),
    inProgress: tally(run.results, "inProgress"),
  };
}

function tally(results: CriterionResult[], suite: EvalSuite): SuiteTally {
  const inSuite = results.filter(result => result.suite === suite);

  return {criteria: inSuite.length, passed: inSuite.filter(result => result.passed).length};
}
