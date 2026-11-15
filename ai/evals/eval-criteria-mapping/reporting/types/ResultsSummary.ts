import type {SuiteTally} from "@evals/eval-criteria-mapping/reporting/types/SuiteTally";
import type {ResultsRun} from "@evals/eval-criteria-mapping/reporting/types/ResultsRun";

/** The small JSON summary left behind by one spec's run: the run itself, with the tallies worked out. */
export interface ResultsSummary extends ResultsRun {
  criteria: number;
  criteriaPassed: number;
  regression: SuiteTally;
  inProgress: SuiteTally;
}
