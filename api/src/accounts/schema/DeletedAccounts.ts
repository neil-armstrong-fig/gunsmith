import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

/**
 * What stays after an account is deleted, for a bounded time and for one purpose: so signing in again does not hand out a fresh daily
 * allowance (`docs/privacy-and-data.md`). **Only** the keyed digest of the Google subject (never the subject), the opaque id the credit
 * ledger knows the account by, and when to forget both. Still personal data while it lasts; nothing else about the person is kept.
 */
export const deletedAccounts = sqliteTable("deleted_accounts", {
  subjectDigest: text("subject_digest").primaryKey(),
  creditAccountId: text("credit_account_id").notNull(),
  keepUntil: integer("keep_until", {mode: "timestamp"}).notNull(),
});
