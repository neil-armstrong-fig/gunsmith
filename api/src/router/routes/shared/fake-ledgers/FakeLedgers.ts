import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {fakeCreditLedger} from "@src/router/routes/shared/fake-ledgers/credit/FakeCreditLedger";
import {fakeSpendLedger} from "@src/router/routes/shared/fake-ledgers/spend/FakeSpendLedger";
import type {FakeLedgers} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgers";
import type {FakeLedgersOptions} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgersOptions";

/** Builds the fake ledgers for a test of a route (`types/FakeLedgers.ts`). Used by the route's unit tests and its property test. */
export function fakeLedgers(options: FakeLedgersOptions = {}): FakeLedgers {
  const calls: string[] = [];
  const credit = fakeCreditLedger(calls);
  const spend = fakeSpendLedger(calls, options);

  const environment = {MATCHES: {}, CREDITS: credit.namespace, SPEND: spend.namespace} as unknown as ApiEnvironment;

  return {environment, calls, accountOf: credit.accountOf, spendMeter: spend.spendMeter};
}
