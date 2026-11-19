import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";

/** The fake `CREDITS` namespace, and the real `CreditAccount` each account name is given, so a test can set up and read a balance. */
export interface FakeCreditLedger {
  namespace: DurableObjectNamespace<CreditLedger>;
  accountOf(accountId: string): CreditAccount;
}
