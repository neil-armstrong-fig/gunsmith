import type {EvalScore} from "@evals/types/EvalScore";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** What running one case produced: every trial's outcome, the scores combined across trials (pass^k) and the time taken. */
export interface WeaponCaseRun {
  outcomes: WeaponOutcome[];
  scores: EvalScore[];
  durationMs: number;
}
