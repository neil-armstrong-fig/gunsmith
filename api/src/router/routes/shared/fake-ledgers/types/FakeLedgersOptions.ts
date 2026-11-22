import type {SpendCaps} from "@src/durable-objects/spend-ledger/types/SpendCaps";

/** How the fake spend ledger answers: AI on unless told otherwise, and when it comes back if it is off. `caps` lowers the real meter's caps, as the Worker's cap vars do. */
export interface FakeLedgersOptions {
  aiOn?: boolean;
  returnsAt?: number;
  caps?: SpendCaps;
}
