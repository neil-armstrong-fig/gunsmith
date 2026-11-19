import type {Account} from "@src/accounts/types/Account";
import {limitOfKind} from "@src/accounts/limit-of-kind/LimitOfKind";
import type {NewGeneratedItem} from "@src/accounts/types/NewGeneratedItem";
import type {NewAccount} from "@src/accounts/types/NewAccount";
import type {NewSession} from "@src/accounts/types/NewSession";
import type {SaveItemRequest} from "@src/accounts/types/SaveItemRequest";
import type {SaveItemResult} from "@src/accounts/types/SaveItemResult";
import type {SavedItem} from "@src/accounts/types/SavedItem";

interface StoredItem extends NewGeneratedItem {
  savedAt?: Date;
}

interface SavedShelfItem extends NewGeneratedItem {
  savedAt: Date;
}

interface StoredAccount extends Account {
  googleSub: string;
}

/**
 * The account functions in memory, for every route test (`SetupApiTests` mocks the real modules to hand out these). Each is an arrow
 * property so a mock can give it out unbound, and each finishes its work before its first `await`, so a test can sign a player in
 * in one expression. `AccountsContract` holds it to what real D1 does.
 */
export class InMemoryAccounts {
  private accounts: StoredAccount[] = [];
  private sessions: NewSession[] = [];
  private items: StoredItem[] = [];

  findOrCreateAccount = async (googleSub: string, newAccount: NewAccount): Promise<Account> => {
    const existing = this.accounts.find(account => account.googleSub === googleSub);
    if (existing) {
      return {id: existing.id, displayName: existing.displayName};
    }

    this.accounts.push({id: newAccount.id, displayName: newAccount.displayName, googleSub});

    return {id: newAccount.id, displayName: newAccount.displayName};
  };

  createSession = async (session: NewSession): Promise<void> => {
    this.sessions = [...this.sessions.filter(held => held.idHash !== session.idHash), session];
  };

  accountOfSession = async (idHash: string, now: Date): Promise<Account | undefined> => {
    const session = this.sessions.find(candidate => candidate.idHash === idHash && candidate.expiresAt > now);
    const account = this.accounts.find(candidate => candidate.id === session?.userId);
    if (!account) {
      return undefined;
    }

    return {id: account.id, displayName: account.displayName};
  };

  deleteSession = async (idHash: string): Promise<void> => {
    this.sessions = this.sessions.filter(session => session.idHash !== idHash);
  };

  removeAccount = async (userId: string): Promise<void> => {
    this.accounts = this.accounts.filter(account => account.id !== userId);
    this.sessions = this.sessions.filter(session => session.userId !== userId);
    this.items = this.items.filter(item => item.userId !== userId);
  };

  keepGeneratedItem = async (item: NewGeneratedItem): Promise<void> => {
    this.items.push({...item});
  };

  savedItemsOfAccount = async (userId: string): Promise<SavedItem[]> => {
    return this.shelfOf(userId)
      .sort(byOrderSaved)
      .map(({id, kind, prompt, payload, savedAt}) => ({id, kind, prompt, payload, savedAt}));
  };

  saveItem = async ({id, userId, now, limits}: SaveItemRequest): Promise<SaveItemResult> => {
    const item = this.items.find(candidate => candidate.id === id && candidate.userId === userId);
    if (!item) {
      return {status: "not-found"};
    }
    if (item.savedAt) {
      return {status: "saved"};
    }

    const limit = limitOfKind(limits, item.kind);
    const placesUsed = this.shelfOf(userId).filter(saved => saved.kind === item.kind).length;
    if (placesUsed >= limit) {
      return {status: "full", kind: item.kind, limit};
    }

    item.savedAt = now;

    return {status: "saved"};
  };

  unsaveItem = async (userId: string, id: string): Promise<boolean> => {
    const item = this.items.find(candidate => candidate.id === id && candidate.userId === userId);
    if (!item) {
      return false;
    }
    item.savedAt = undefined;

    return true;
  };

  reset = (): void => {
    this.accounts = [];
    this.sessions = [];
    this.items = [];
  };

  private shelfOf(userId: string): SavedShelfItem[] {
    return this.items.flatMap(item => {
      if (item.userId !== userId || !item.savedAt) {
        return [];
      }

      return [{...item, savedAt: item.savedAt}];
    });
  }
}

function byOrderSaved(first: SavedShelfItem, second: SavedShelfItem): number {
  const earlier = first.savedAt.getTime() - second.savedAt.getTime();
  if (earlier !== 0) {
    return earlier;
  }
  if (first.id < second.id) {
    return -1;
  }

  return 1;
}
