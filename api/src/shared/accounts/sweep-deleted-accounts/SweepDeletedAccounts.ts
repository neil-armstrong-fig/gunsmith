import {database} from "@src/shared/accounts/Database";
import {deletedAccounts} from "@src/shared/accounts/schema/DeletedAccounts";
import {lte} from "drizzle-orm";

/** Forgets every record whose time to keep has come at `now`, and answers the credit ids they held, for the caller to erase from the ledger. */
export async function sweepDeletedAccounts(now: Date): Promise<string[]> {
  const expired = await database()
    .delete(deletedAccounts)
    .where(lte(deletedAccounts.keepUntil, now))
    .returning({creditAccountId: deletedAccounts.creditAccountId});

  return expired.map(({creditAccountId}) => creditAccountId);
}
