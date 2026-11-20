import type {DeletedAccountRecord} from "@src/accounts/testing/local-database/types/DeletedAccountRecord";

/** For a test of the real account functions: puts a record of a deleted account in the database, as `removeAccount` would have left it. */
export async function insertDeletedAccount(
  database: D1Database,
  {subjectDigest, creditAccountId, keepUntilSeconds}: DeletedAccountRecord,
): Promise<void> {
  await database
    .prepare("INSERT INTO deleted_accounts (subject_digest, credit_account_id, keep_until) VALUES (?, ?, ?)")
    .bind(subjectDigest, creditAccountId, keepUntilSeconds)
    .run();
}
