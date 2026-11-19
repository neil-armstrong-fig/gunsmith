import type {CreditAccount} from "@src/ai/credits/account/CreditAccount";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";

/**
 * The two ledgers a route asks, standing in for the Durable Objects: each account is budget's real `CreditAccount` (so a balance is
 * what the real rules make it), and `calls` is every call the route made to either ledger, in order, written like `reserve:weapon`.
 */
export interface FakeLedgers {
  environment: ApiEnvironment;
  calls: string[];
  accountOf(accountId: string): CreditAccount;
}
