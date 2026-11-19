import {CreditAccount} from "@src/ai/credits/account/CreditAccount";
import type {CreditLedger} from "@src/ai/credits/CreditLedger";
import type {CreditKind} from "@src/ai/credits/types/CreditKind";
import type {ReserveOutcome} from "@src/ai/credits/types/ReserveOutcome";
import type {SpendLedger} from "@src/ai/spend/SpendLedger";
import type {AiStatus} from "@src/ai/spend/types/AiStatus";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import type {FakeLedgers} from "@src/generation/fake-ledgers/types/FakeLedgers";
import type {FakeLedgersOptions} from "@src/generation/fake-ledgers/types/FakeLedgersOptions";

/** Builds the fake ledgers for a test of a route (`types/FakeLedgers.ts`). Used by the route's unit tests and its property test. */
export function fakeLedgers(options: FakeLedgersOptions = {}): FakeLedgers {
  const accounts = new Map<string, CreditAccount>();
  const calls: string[] = [];

  const accountOf = (accountId: string): CreditAccount => {
    const known = accounts.get(accountId);
    if (known) {
      return known;
    }

    const fresh = new CreditAccount();
    accounts.set(accountId, fresh);

    return fresh;
  };

  const creditStub = (accountId: string): unknown => ({
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
  });

  const spendStub = (): unknown => ({
    status: async (): Promise<AiStatus> => {
      calls.push("status");

      return {on: options.aiOn ?? true, returnsAt: options.returnsAt};
    },
  });

  const environment = {
    MATCHES: {},
    CREDITS: {getByName: creditStub} as unknown as DurableObjectNamespace<CreditLedger>,
    SPEND: {getByName: spendStub} as unknown as DurableObjectNamespace<SpendLedger>,
  } as unknown as ApiEnvironment;

  return {environment, calls, accountOf};
}
