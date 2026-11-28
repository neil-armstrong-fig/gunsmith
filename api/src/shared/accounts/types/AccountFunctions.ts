import type {accountOfSession} from "@src/shared/accounts/account-of-session/AccountOfSession";
import type {arenaPlaysSince} from "@src/shared/accounts/arena-plays-since/ArenaPlaysSince";
import type {claimDeletedAccountId} from "@src/shared/accounts/claim-deleted-account-id/ClaimDeletedAccountId";
import type {countArenaPlay} from "@src/shared/accounts/count-arena-play/CountArenaPlay";
import type {createSession} from "@src/shared/accounts/create-session/CreateSession";
import type {deleteSession} from "@src/shared/accounts/delete-session/DeleteSession";
import type {findOrCreateAccount} from "@src/shared/accounts/find-or-create-account/FindOrCreateAccount";
import type {keepGeneratedItem} from "@src/shared/accounts/keep-generated-item/KeepGeneratedItem";
import type {removeAccount} from "@src/shared/accounts/remove-account/RemoveAccount";
import type {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import type {savedItemsOfAccount} from "@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount";
import type {sweepDeletedAccounts} from "@src/shared/accounts/sweep-deleted-accounts/SweepDeletedAccounts";
import type {unsaveItem} from "@src/shared/accounts/unsave-item/UnsaveItem";

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
