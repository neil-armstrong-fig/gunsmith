import {DurableObject} from "cloudflare:workers";
import {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import type {CreditKind} from "@src/durable-objects/credit-ledger/types/CreditKind";
import type {CreditAccountState} from "@src/durable-objects/credit-ledger/types/CreditAccountState";
import type {ReserveOutcome} from "@src/durable-objects/credit-ledger/types/ReserveOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";

const ACCOUNT_KEY = "account";

/**
 * One account's credits, a Durable Object named by the internal account id (`env.CREDITS.idFromName(accountId)`). This is the Workers
 * runtime's edge and is kept to wiring (not unit tested, like `durable-objects/match/Match.ts`): what is decided is in `CreditAccount`. It reads the
 * clock, loads the saved state, makes the one change and saves it again, **all in one synchronous run with no `await`**, so the object's
 * one-request-at-a-time guarantee makes two requests for the last credit safe. Callers use it over RPC: `stub.reserve(key, kind)`.
 */
export class CreditLedger extends DurableObject<ApiEnvironment> {
  reserve(key: string, kind: CreditKind): ReserveOutcome {
    return this.change(account => account.reserve(key, kind, Date.now()));
  }

  settle(key: string, kind: CreditKind): void {
    this.change(account => {
      account.settle(key, kind, Date.now());
    });
  }

  refund(key: string): void {
    this.change(account => {
      account.refund(key, Date.now());
    });
  }

  balance(): number {
    return this.change(account => account.balance(Date.now()));
  }

  private change<Result>(use: (account: CreditAccount) => Result): Result {
    const account = new CreditAccount(this.ctx.storage.kv.get<CreditAccountState>(ACCOUNT_KEY));
    const result = use(account);
    this.ctx.storage.kv.put(ACCOUNT_KEY, account.toState());

    return result;
  }
}
