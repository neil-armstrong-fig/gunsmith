import {database} from "@src/shared/accounts/Database";
import {deletedAccounts} from "@src/shared/accounts/schema/DeletedAccounts";
import {and, eq, gt} from "drizzle-orm";

/**
 * The credit id a returning person's deleted account was held under, if it is still being kept at `now`, **and the record is used up**
 * (one statement: `DELETE ... RETURNING`, so two claims arriving together give it to only one). The new account takes that id, so
 * its credits are the ones the old account had, not a fresh allowance.
 */
export async function claimDeletedAccountId(subjectDigest: string, now: Date): Promise<string | undefined> {
  const [claimed] = await database()
    .delete(deletedAccounts)
    .where(and(eq(deletedAccounts.subjectDigest, subjectDigest), gt(deletedAccounts.keepUntil, now)))
    .returning({creditAccountId: deletedAccounts.creditAccountId});

  return claimed?.creditAccountId;
}
