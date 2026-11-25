import {accountOfSession} from "@src/accounts/account-of-session/AccountOfSession";
import {arenaPlaysSince} from "@src/accounts/arena-plays-since/ArenaPlaysSince";
import {claimDeletedAccountId} from "@src/accounts/claim-deleted-account-id/ClaimDeletedAccountId";
import {countArenaPlay} from "@src/accounts/count-arena-play/CountArenaPlay";
import {createSession} from "@src/accounts/create-session/CreateSession";
import {deleteSession} from "@src/accounts/delete-session/DeleteSession";
import {findOrCreateAccount} from "@src/accounts/find-or-create-account/FindOrCreateAccount";
import {keepGeneratedItem} from "@src/accounts/keep-generated-item/KeepGeneratedItem";
import {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import {saveItem} from "@src/accounts/save-item/SaveItem";
import {savedItemsOfAccount} from "@src/accounts/saved-items-of-account/SavedItemsOfAccount";
import {accountsContract} from "@src/accounts/testing/contract/AccountsContract";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";
import {sweepDeletedAccounts} from "@src/accounts/sweep-deleted-accounts/SweepDeletedAccounts";
import {unsaveItem} from "@src/accounts/unsave-item/UnsaveItem";

// The real functions together, over a real local D1, held to the contract the in-memory ones pass (`InMemoryAccounts.test.ts`).
vi.unmock("@src/accounts/account-of-session/AccountOfSession");
vi.unmock("@src/accounts/create-session/CreateSession");
vi.unmock("@src/accounts/delete-session/DeleteSession");
vi.unmock("@src/accounts/find-or-create-account/FindOrCreateAccount");
vi.unmock("@src/accounts/remove-account/RemoveAccount");
vi.unmock("@src/accounts/claim-deleted-account-id/ClaimDeletedAccountId");
vi.unmock("@src/accounts/sweep-deleted-accounts/SweepDeletedAccounts");
vi.unmock("@src/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/accounts/saved-items-of-account/SavedItemsOfAccount");
vi.unmock("@src/accounts/save-item/SaveItem");
vi.unmock("@src/accounts/unsave-item/UnsaveItem");
vi.unmock("@src/accounts/count-arena-play/CountArenaPlay");
vi.unmock("@src/accounts/arena-plays-since/ArenaPlaysSince");

const emptyDatabase = useLocalDatabase();

accountsContract(async () => {
  await emptyDatabase();

  return {
    findOrCreateAccount,
    createSession,
    accountOfSession,
    deleteSession,
    removeAccount,
    claimDeletedAccountId,
    sweepDeletedAccounts,
    keepGeneratedItem,
    savedItemsOfAccount,
    saveItem,
    unsaveItem,
    countArenaPlay,
    arenaPlaysSince,
  };
});
