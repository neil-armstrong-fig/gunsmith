import {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";

// The total ceiling for every paid run together: `ai/AGENTS.md` says $1 for now and to ask before raising it.
const PAID_CEILING_DOLLARS = 1;
const LEDGER_FILE = "evals/results/paid-spend-latest.json";

/** The one ledger every paid run adds to (`*-latest.json` is git-ignored). */
export function paidSpendLedger(): SpendLedger {
  return new SpendLedger({file: LEDGER_FILE, ceilingDollars: PAID_CEILING_DOLLARS});
}
