import {SpendMeter} from "@src/durable-objects/spend-ledger/meter/SpendMeter";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";
import type {AiStatus} from "@src/durable-objects/spend-ledger/types/AiStatus";
import type {SpendOutcome} from "@src/durable-objects/spend-ledger/types/SpendOutcome";
import type {FakeLedgersOptions} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgersOptions";
import type {FakeSpendLedger} from "@src/router/routes/shared/fake-ledgers/spend/types/FakeSpendLedger";

/**
 * The `SPEND` namespace as a route sees it: the one global ledger is the real `SpendMeter`, except that `options.aiOn === false` makes
 * `status()` answer off (with `options.returnsAt`) whatever the meter says. Every call a route makes is pushed on `calls`, written like
 * `status`, `spend:reserve` or `spend:settle`.
 */
export function fakeSpendLedger(calls: string[], options: FakeLedgersOptions): FakeSpendLedger {
  const spendMeter = new SpendMeter();

  const stub = (): unknown => ({
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

  return {namespace: {getByName: stub} as unknown as DurableObjectNamespace<SpendLedger>, spendMeter};
}
