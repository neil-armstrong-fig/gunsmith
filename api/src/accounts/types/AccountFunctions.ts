import type {accountOfSession} from "@src/accounts/account-of-session/AccountOfSession";
import type {arenaPlaysSince} from "@src/accounts/arena-plays-since/ArenaPlaysSince";
import type {claimDeletedAccountId} from "@src/accounts/claim-deleted-account-id/ClaimDeletedAccountId";
import type {countArenaPlay} from "@src/accounts/count-arena-play/CountArenaPlay";
import type {createSession} from "@src/accounts/create-session/CreateSession";
import type {deleteSession} from "@src/accounts/delete-session/DeleteSession";
import type {findOrCreateAccount} from "@src/accounts/find-or-create-account/FindOrCreateAccount";
import type {keepGeneratedItem} from "@src/accounts/keep-generated-item/KeepGeneratedItem";
import type {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import type {saveItem} from "@src/accounts/save-item/SaveItem";
import type {savedItemsOfAccount} from "@src/accounts/saved-items-of-account/SavedItemsOfAccount";
import type {sweepDeletedAccounts} from "@src/accounts/sweep-deleted-accounts/SweepDeletedAccounts";
import type {unsaveItem} from "@src/accounts/unsave-item/UnsaveItem";

/** The things done with accounts and their shelf, as `typeof` the real functions: what the in-memory stand-in and real D1 must both do the same (`testing/AccountsContract`). */
export interface AccountFunctions {
  findOrCreateAccount: typeof findOrCreateAccount;
  createSession: typeof createSession;
  accountOfSession: typeof accountOfSession;
  deleteSession: typeof deleteSession;
  removeAccount: typeof removeAccount;
  claimDeletedAccountId: typeof claimDeletedAccountId;
  sweepDeletedAccounts: typeof sweepDeletedAccounts;
  keepGeneratedItem: typeof keepGeneratedItem;
  savedItemsOfAccount: typeof savedItemsOfAccount;
  saveItem: typeof saveItem;
  unsaveItem: typeof unsaveItem;
  countArenaPlay: typeof countArenaPlay;
  arenaPlaysSince: typeof arenaPlaysSince;
}
