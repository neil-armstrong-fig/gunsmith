import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";
import type {CriterionResult} from "@evals/eval-criteria-mapping/environment/reporting/types/CriterionResult";

/** What is known about one spec file's run, ready to be summarised. */
export interface ResultsRun {
  spec: string;
  tier: EvalTier;
  /** How many times each request ran; a criterion passes only if it held in every one (pass^k). */
  trials: number;
  ranAt: string;
  results: CriterionResult[];
}
