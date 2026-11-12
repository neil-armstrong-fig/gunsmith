import type {EvalScore} from "@evals/types/EvalScore";
import type {WeaponEvalKind, WeaponEvalSuite} from "@evals/types/WeaponEvalCase";

/** One case's scores from one eval run. */
export interface EvalCaseResult {
  name: string;
  kind: WeaponEvalKind;
  suite: WeaponEvalSuite;
  /** How many times the case ran; the scores are combined so a case passes only if every trial did (pass^k). */
  trials: number;
  /** Wall-clock time for all the trials. Tokens and cost join it once the nodes call real models. */
  durationMs: number;
  scores: EvalScore[];
}
