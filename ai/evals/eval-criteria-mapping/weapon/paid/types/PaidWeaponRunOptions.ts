import type {SpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendGuard";
import type {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/** What one paid weapon request runs against: the real pipeline, the ledger that caps it, the guard that watched its calls, and the log. */
export interface PaidWeaponRunOptions {
  /** Puts the request through the pipeline on the paid models. */
  pipeline: (prompt: string) => Promise<WeaponOutcome>;
  /** The total the paid tier may spend, checked before a request starts. */
  ledger: SpendLedger;
  /** Carried by both paid models, so it saw every call of the request. */
  guard: SpendGuard;
  /** The JSON Lines file the request's calls are added to. */
  logFile: string;
}
