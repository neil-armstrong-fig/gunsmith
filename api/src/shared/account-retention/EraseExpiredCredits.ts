import {sweepDeletedAccounts} from "@src/shared/accounts/sweep-deleted-accounts/SweepDeletedAccounts";
import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";

/**
 * Forgets the records whose retention has run out and erases the ledgers they named, **each on its own**: the records are already gone,
 * so one ledger that fails must not leave the rest unerased. A database failure leaves the expired records for the next sweep.
 */
export async function eraseExpiredCredits(now: Date): Promise<void> {
  let creditAccountIds: string[];
  try {
    creditAccountIds = await sweepDeletedAccounts(now);
  } catch (error) {
    logNotErased(error);

    return;
  }

  for (const creditAccountId of creditAccountIds) {
    try {
      await workerEnvironment.CREDITS.getByName(creditAccountId).erase();
    } catch (error) {
      logNotErased(error);
    }
  }
}

function logNotErased(error: unknown): void {
  console.warn(
    JSON.stringify({
      route: "account",
      outcome: "credits-not-erased",
      error: error instanceof Error ? error.name : undefined,
    }),
  );
}
