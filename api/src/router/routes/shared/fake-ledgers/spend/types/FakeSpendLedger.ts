import type {SpendMeter} from "@src/durable-objects/spend-ledger/meter/SpendMeter";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";

/** The fake `SPEND` namespace, and the real `SpendMeter` behind it, so a test can read what was reserved and spent. */
export interface FakeSpendLedger {
  namespace: DurableObjectNamespace<SpendLedger>;
  spendMeter: SpendMeter;
}
