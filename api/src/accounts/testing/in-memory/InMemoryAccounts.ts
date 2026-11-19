import type {Account} from "@src/accounts/types/Account";
import type {NewAccount} from "@src/accounts/types/NewAccount";
import type {NewSession} from "@src/accounts/types/NewSession";

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
  };

  reset = (): void => {
    this.accounts = [];
    this.sessions = [];
  };
}
