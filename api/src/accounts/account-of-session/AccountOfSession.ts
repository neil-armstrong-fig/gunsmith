import {database} from "@src/accounts/Database";
import {sessions} from "@src/accounts/schema/Sessions";
import {users} from "@src/accounts/schema/Users";
import type {Account} from "@src/accounts/types/Account";
import {and, eq, gt} from "drizzle-orm";

/** Whose session this is, if it exists and has not expired at `now` (the second it expires, it is over). */
export async function accountOfSession(idHash: string, now: Date): Promise<Account | undefined> {
  const [account] = await database()
    .select({id: users.id, displayName: users.displayName})
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.idHash, idHash), gt(sessions.expiresAt, now)));

  return account;
}
