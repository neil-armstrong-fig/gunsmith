import {accountOfSession} from "@src/shared/accounts/account-of-session/AccountOfSession";
import {arenaPlaysSince} from "@src/shared/accounts/arena-plays-since/ArenaPlaysSince";
import {claimDeletedAccountId} from "@src/shared/accounts/claim-deleted-account-id/ClaimDeletedAccountId";
import {countArenaPlay} from "@src/shared/accounts/count-arena-play/CountArenaPlay";
import {createSession} from "@src/shared/accounts/create-session/CreateSession";
import {deleteSession} from "@src/shared/accounts/delete-session/DeleteSession";
import {findOrCreateAccount} from "@src/shared/accounts/find-or-create-account/FindOrCreateAccount";
import {keepGeneratedItem} from "@src/shared/accounts/keep-generated-item/KeepGeneratedItem";
import {removeAccount} from "@src/shared/accounts/remove-account/RemoveAccount";
import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {savedItemsOfAccount} from "@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount";
import {accountsContract} from "@src/shared/accounts/testing/contract/AccountsContract";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";
import {sweepDeletedAccounts} from "@src/shared/accounts/sweep-deleted-accounts/SweepDeletedAccounts";
import {unsaveItem} from "@src/shared/accounts/unsave-item/UnsaveItem";

// The real functions together, over a real local D1, held to the contract the in-memory ones pass (`InMemoryAccounts.test.ts`).
vi.unmock("@src/shared/accounts/account-of-session/AccountOfSession");
vi.unmock("@src/shared/accounts/create-session/CreateSession");
vi.unmock("@src/shared/accounts/delete-session/DeleteSession");
vi.unmock("@src/shared/accounts/find-or-create-account/FindOrCreateAccount");
vi.unmock("@src/shared/accounts/remove-account/RemoveAccount");
vi.unmock("@src/shared/accounts/claim-deleted-account-id/ClaimDeletedAccountId");
vi.unmock("@src/shared/accounts/sweep-deleted-accounts/SweepDeletedAccounts");
vi.unmock("@src/shared/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount");
vi.unmock("@src/shared/accounts/save-item/SaveItem");
vi.unmock("@src/shared/accounts/unsave-item/UnsaveItem");
vi.unmock("@src/shared/accounts/count-arena-play/CountArenaPlay");
vi.unmock("@src/shared/accounts/arena-plays-since/ArenaPlaysSince");

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
