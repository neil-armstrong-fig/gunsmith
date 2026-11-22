import {SpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendLedger";

// The total ceiling for every paid run together: $2, raised from $1 by the user on 2026-11-20; `ai/AGENTS.md` says to ask before raising it again.
const PAID_CEILING_DOLLARS = 2;
const LEDGER_FILE = "src/evals/results/paid-spend-latest.json";

/** The one ledger every paid run adds to (`*-latest.json` is git-ignored). */
export function paidSpendLedger(): SpendLedger {
  return new SpendLedger({file: LEDGER_FILE, ceilingDollars: PAID_CEILING_DOLLARS});
}
