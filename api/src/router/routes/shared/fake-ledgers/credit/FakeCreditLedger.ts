import {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {CreditKind} from "@src/durable-objects/credit-ledger/types/CreditKind";
import type {ReserveOutcome} from "@src/durable-objects/credit-ledger/types/ReserveOutcome";
import type {FakeCreditLedger} from "@src/router/routes/shared/fake-ledgers/credit/types/FakeCreditLedger";

/**
 * The `CREDITS` namespace as a route sees it: each account name gets its own real `CreditAccount` (made on first use), and every call a
 * route makes to one is pushed on `calls`, written like `reserve:weapon`, `settle:rejected`, `refund` or `balance`.
 */
export function fakeCreditLedger(calls: string[]): FakeCreditLedger {
  const accounts = new Map<string, CreditAccount>();

  const accountOf = (accountId: string): CreditAccount => {
    const known = accounts.get(accountId);
    if (known) {
      return known;
    }

    const fresh = new CreditAccount();
    accounts.set(accountId, fresh);

    return fresh;
  };

  const stubOf = (accountId: string): unknown => ({
    reserve: async (key: string, kind: CreditKind): Promise<ReserveOutcome> => {
      calls.push(`reserve:${kind}`);

      return accountOf(accountId).reserve(key, kind, Date.now());
    },
    settle: async (key: string, kind: CreditKind): Promise<void> => {
      calls.push(`settle:${kind}`);
      accountOf(accountId).settle(key, kind, Date.now());
    },
    refund: async (key: string): Promise<void> => {
      calls.push("refund");
      accountOf(accountId).refund(key, Date.now());
    },
    balance: async (): Promise<number> => {
      calls.push("balance");

      return accountOf(accountId).balance(Date.now());
    },
  });

  return {namespace: {getByName: stubOf} as unknown as DurableObjectNamespace<CreditLedger>, accountOf};
}
