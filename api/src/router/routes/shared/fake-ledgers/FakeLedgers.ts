import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {fakeCreditLedger} from "@src/router/routes/shared/fake-ledgers/credit/FakeCreditLedger";
import {fakeSpendLedger} from "@src/router/routes/shared/fake-ledgers/spend/FakeSpendLedger";
import type {FakeLedgers} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgers";
import type {FakeLedgersOptions} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgersOptions";

/** Builds the fake ledgers for a test of a route (`types/FakeLedgers.ts`). Used by the route's unit tests and its property test. */
export function fakeLedgers(options: FakeLedgersOptions = {}): FakeLedgers {
  const calls: string[] = [];
  const credit = fakeCreditLedger(calls);
  const spend = fakeSpendLedger(calls, options);

  Object.assign(workerEnvironment, {CREDITS: credit.namespace, SPEND: spend.namespace});

  return {calls, accountOf: credit.accountOf, spendMeter: spend.spendMeter};
}
