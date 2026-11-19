import {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {CreditKind} from "@src/durable-objects/credit-ledger/types/CreditKind";
import type {ReserveOutcome} from "@src/durable-objects/credit-ledger/types/ReserveOutcome";
import {SpendMeter} from "@src/durable-objects/spend-ledger/meter/SpendMeter";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";
import type {AiStatus} from "@src/durable-objects/spend-ledger/types/AiStatus";
import type {SpendOutcome} from "@src/durable-objects/spend-ledger/types/SpendOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import type {FakeLedgers} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgers";
import type {FakeLedgersOptions} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgersOptions";

/** Builds the fake ledgers for a test of a route (`types/FakeLedgers.ts`). Used by the route's unit tests and its property test. */
export function fakeLedgers(options: FakeLedgersOptions = {}): FakeLedgers {
  const accounts = new Map<string, CreditAccount>();
  const spendMeter = new SpendMeter();
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
      if (options.aiOn === false) {
        return {on: false, returnsAt: options.returnsAt};
      }

      return spendMeter.status(Date.now());
    },
    reserve: async (key: string, microdollars: number): Promise<SpendOutcome> => {
      calls.push("spend:reserve");

      return spendMeter.reserve(key, microdollars, Date.now());
    },
    settle: async (key: string, microdollars: number): Promise<void> => {
      calls.push("spend:settle");
      spendMeter.settle(key, microdollars, Date.now());
    },
  });

  const environment = {
    MATCHES: {},
    CREDITS: {getByName: creditStub} as unknown as DurableObjectNamespace<CreditLedger>,
    SPEND: {getByName: spendStub} as unknown as DurableObjectNamespace<SpendLedger>,
  } as unknown as ApiEnvironment;

  return {environment, calls, accountOf, spendMeter};
}
