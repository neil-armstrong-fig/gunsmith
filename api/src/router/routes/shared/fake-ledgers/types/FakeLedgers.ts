import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import type {SpendMeter} from "@src/durable-objects/spend-ledger/meter/SpendMeter";

/**
 * The two ledgers a route asks, standing in for the Durable Objects: each account is budget's real `CreditAccount` and the global spend
 * is its real `SpendMeter` (so a balance and a cap are what the real rules make them), and `calls` is every call the route made to either ledger, in order, written like `reserve:weapon`.
 */
export interface FakeLedgers {
  calls: string[];
  accountOf(accountId: string): CreditAccount;
  spendMeter: SpendMeter;
}
