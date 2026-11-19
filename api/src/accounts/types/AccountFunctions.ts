import type {accountOfSession} from "@src/accounts/account-of-session/AccountOfSession";
import type {createSession} from "@src/accounts/create-session/CreateSession";
import type {deleteSession} from "@src/accounts/delete-session/DeleteSession";
import type {findOrCreateAccount} from "@src/accounts/find-or-create-account/FindOrCreateAccount";
import type {removeAccount} from "@src/accounts/remove-account/RemoveAccount";

/** The five things done with accounts, as `typeof` the real functions: what the in-memory stand-in and real D1 must both do the same (`testing/AccountsContract`). */
export interface AccountFunctions {
  findOrCreateAccount: typeof findOrCreateAccount;
  createSession: typeof createSession;
  accountOfSession: typeof accountOfSession;
  deleteSession: typeof deleteSession;
  removeAccount: typeof removeAccount;
}
