import {database} from "@src/shared/accounts/Database";
import {deletedAccounts} from "@src/shared/accounts/schema/DeletedAccounts";
import {users} from "@src/shared/accounts/schema/Users";
import type {AccountRemoval} from "@src/shared/accounts/types/AccountRemoval";
import {eq} from "drizzle-orm";

/**
 * Removes the account; its sessions and kept items go with it by `ON DELETE cascade`. **One thing is kept, for `keepUntil` only:** the
 * keyed digest of the person's Google subject beside the opaque id their credits are held under (`schema/DeletedAccounts`), so that
 * deleting and signing in again cannot hand out a fresh allowance (`claimDeletedAccountId`). The record and the removal are written in
 * one batch, so neither happens without the other. An account that is not there removes nothing and keeps nothing.
 */
export async function removeAccount(userId: string, {subjectDigest, keepUntil}: AccountRemoval): Promise<void> {
  const [account] = await database().select({googleSub: users.googleSub}).from(users).where(eq(users.id, userId));
  if (!account) {
    return;
  }

  const digest = await subjectDigest(account.googleSub);
  await database().batch([
    database()
      .insert(deletedAccounts)
      .values({subjectDigest: digest, creditAccountId: userId, keepUntil})
      .onConflictDoUpdate({target: deletedAccounts.subjectDigest, set: {creditAccountId: userId, keepUntil}}),
    database().delete(users).where(eq(users.id, userId)),
  ]);
}
