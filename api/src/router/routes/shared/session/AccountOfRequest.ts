import {accountOfSession} from "@src/shared/accounts/account-of-session/AccountOfSession";
import type {Account} from "@src/shared/accounts/types/Account";
import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";
import {sessionTokenFrom} from "@src/router/routes/shared/session/SessionTokenFrom";

/**
 * Whose request this is: the account whose live session the `Cookie` header carries, or nobody. With no cookie the database is never
 * asked, so a Worker whose database has not been set up still serves guests.
 */
export async function accountOfRequest(request: Request): Promise<Account | undefined> {
  const token = sessionTokenFrom(request.headers.get("Cookie") ?? undefined);
  if (!token) {
    return undefined;
  }

  return await accountOfSession(await hashSessionToken(token), new Date());
}
