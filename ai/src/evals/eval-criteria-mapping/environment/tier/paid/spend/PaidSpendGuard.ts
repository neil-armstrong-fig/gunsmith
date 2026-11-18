import {paidSpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendLedger";
import {SpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendGuard";

let guard: SpendGuard | undefined;

/** The one guard the paid model carries, which the driver asks after each request whether a call failed. */
export function paidSpendGuard(): SpendGuard {
  guard ??= new SpendGuard(paidSpendLedger());

  return guard;
}
