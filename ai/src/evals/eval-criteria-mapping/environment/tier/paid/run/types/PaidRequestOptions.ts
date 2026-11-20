import type {SpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendGuard";
import type {SpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendLedger";

/** What one paid request runs against: the pipeline call, the ledger that caps it, the guard that watched its calls, and the log. */
export interface PaidRequestOptions<Outcome> {
  /** Puts the request through the pipeline on the paid models. */
  run: () => Promise<Outcome>;
  /** The total the paid tier may spend, checked before a request starts. */
  ledger: SpendLedger;
  /** Carried by every paid model, so it saw every call of the request. */
  guard: SpendGuard;
  /** The JSON Lines file the request's calls are added to. */
  logFile: string;
  /** What the request makes ("the weapon", "the arena"), for the words a failed run ends with. */
  subject: string;
  /** The stage of a call that ran in no graph node (a screening makes only moderation calls), when the pipeline is not a graph. */
  defaultStage?: string;
}
