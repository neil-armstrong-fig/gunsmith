/** How the fake spend ledger answers: AI on unless told otherwise, and when it comes back if it is off. */
export interface FakeLedgersOptions {
  aiOn?: boolean;
  returnsAt?: number;
}
