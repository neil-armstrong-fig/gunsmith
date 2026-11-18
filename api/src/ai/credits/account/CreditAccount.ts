import {CREDIT_PRICES} from "@src/ai/credits/account/CreditPrices";
import type {CreditKind} from "@src/ai/credits/types/CreditKind";
import {DAILY_CREDITS} from "@src/ai/credits/account/DailyCredits";
import type {CreditAccountState} from "@src/ai/credits/types/CreditAccountState";
import type {ReserveOutcome} from "@src/ai/credits/types/ReserveOutcome";
import {utcDay} from "@src/ai/utc/UtcDay";

const NO_DAY_YET = -1;

/**
 * One account's credits, as plain state with no storage in it. **Every method is synchronous on purpose:** the Durable Object runs one
 * request at a time, so a method with no `await` between its read and its write cannot interleave with another request. That serial
 * guarantee is what makes two requests for the last credit safe; keep it, and do not add an `await` here. The Durable Object
 * (`credits/CreditLedger.ts`) saves `toState()` after each call and rebuilds the account from it.
 *
 * A request is identified by its `key`, one per request: reserving the same key again charges nothing more (a retry), and a refund or a
 * settle takes effect once. A request is reserved at its full price before the model is called, then settled at what it really was
 * (a rejected prompt costs half) or refunded in full (a timeout). Credits reset at 00:00 UTC; a request from an earlier day is forgotten
 * at the reset, so its late refund changes nothing.
 */
export class CreditAccount {
  private readonly state: CreditAccountState;

  constructor(saved?: CreditAccountState) {
    this.state = structuredClone(saved ?? {day: NO_DAY_YET, balance: DAILY_CREDITS, reservations: {}});
  }

  reserve(key: string, kind: CreditKind, now: number): ReserveOutcome {
    this.resetIfANewDay(now);

    const existing = this.state.reservations[key];
    if (existing) {
      return "reserved";
    }

    const price = CREDIT_PRICES[kind];
    if (price > this.state.balance) {
      return "insufficient";
    }

    this.state.balance -= price;
    this.state.reservations[key] = {charged: price, held: true};

    return "reserved";
  }

  /** Charges the request at what it turned out to be, giving back the difference. Does nothing for a request already settled or refunded. */
  settle(key: string, kind: CreditKind, now: number): void {
    this.resetIfANewDay(now);

    const reservation = this.state.reservations[key];
    if (!reservation?.held) {
      return;
    }

    const charged = Math.min(CREDIT_PRICES[kind], reservation.charged);
    this.state.balance += reservation.charged - charged;
    reservation.charged = charged;
    reservation.held = false;
  }

  /** Gives the whole charge back. Does nothing for a request already settled or refunded, or one this account does not know. */
  refund(key: string, now: number): void {
    this.resetIfANewDay(now);

    const reservation = this.state.reservations[key];
    if (!reservation?.held) {
      return;
    }

    this.state.balance += reservation.charged;
    reservation.charged = 0;
    reservation.held = false;
  }

  balance(now: number): number {
    this.resetIfANewDay(now);

    return this.state.balance;
  }

  toState(): CreditAccountState {
    return structuredClone(this.state);
  }

  private resetIfANewDay(now: number): void {
    const day = utcDay(now);
    if (day === this.state.day) {
      return;
    }

    this.state.day = day;
    this.state.balance = DAILY_CREDITS;
    this.state.reservations = {};
  }
}
