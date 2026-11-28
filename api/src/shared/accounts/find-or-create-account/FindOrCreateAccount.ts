import {database} from "@src/shared/accounts/Database";
import {users} from "@src/shared/accounts/schema/Users";
import type {Account} from "@src/shared/accounts/types/Account";
import type {NewAccount} from "@src/shared/accounts/types/NewAccount";
import {eq} from "drizzle-orm";

/**
 * The account for this Google subject: the one that exists, else `newAccount` stored. **One statement** (`onConflictDoNothing`) then a
 * read, so two first sign-ins at once make one account: D1 has no transaction a request could hold open.
 */
export async function findOrCreateAccount(googleSub: string, newAccount: NewAccount): Promise<Account> {
  await database()
    .insert(users)
    .values({id: newAccount.id, googleSub, displayName: newAccount.displayName, createdAt: newAccount.now})
    .onConflictDoNothing({target: users.googleSub});

  const [account] = await database()
    .select({id: users.id, displayName: users.displayName})
    .from(users)
    .where(eq(users.googleSub, googleSub));
  if (!account) {
    throw new Error("account missing straight after it was stored");
  }

  return account;
}
