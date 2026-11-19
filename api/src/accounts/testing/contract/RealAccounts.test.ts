import {accountOfSession} from "@src/accounts/account-of-session/AccountOfSession";
import {createSession} from "@src/accounts/create-session/CreateSession";
import {deleteSession} from "@src/accounts/delete-session/DeleteSession";
import {findOrCreateAccount} from "@src/accounts/find-or-create-account/FindOrCreateAccount";
import {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import {accountsContract} from "@src/accounts/testing/contract/AccountsContract";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";

// The five real functions together, over a real local D1, held to the contract the in-memory ones pass (`InMemoryAccounts.test.ts`).
vi.unmock("@src/accounts/account-of-session/AccountOfSession");
vi.unmock("@src/accounts/create-session/CreateSession");
vi.unmock("@src/accounts/delete-session/DeleteSession");
vi.unmock("@src/accounts/find-or-create-account/FindOrCreateAccount");
vi.unmock("@src/accounts/remove-account/RemoveAccount");

const emptyDatabase = useLocalDatabase();

accountsContract(async () => {
  await emptyDatabase();

  return {findOrCreateAccount, createSession, accountOfSession, deleteSession, removeAccount};
});
