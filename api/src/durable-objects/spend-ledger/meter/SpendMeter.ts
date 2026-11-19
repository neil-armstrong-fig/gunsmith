import {nextUtcMidnight} from "@src/durable-objects/spend-ledger/meter/periods/NextUtcMidnight";
import {nextUtcMonthStart} from "@src/durable-objects/spend-ledger/meter/periods/NextUtcMonthStart";
import {utcMonth} from "@src/durable-objects/spend-ledger/meter/periods/UtcMonth";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import type {AiStatus} from "@src/durable-objects/spend-ledger/types/AiStatus";
import type {SpendMeterState} from "@src/durable-objects/spend-ledger/types/SpendMeterState";
import type {SpendOutcome} from "@src/durable-objects/spend-ledger/types/SpendOutcome";
import {utcDay} from "@src/durable-objects/shared/utc/UtcDay";

const NOTHING_YET = -1;

/** The shares of the month's cap at which an alert is raised, each due until its delivery is marked sent (`docs/cost-and-budget.md`, layer 5). */
const ALERT_PERCENTS: readonly number[] = [50, 80, 100];
const FULL_BUDGET_PERCENT = 100;

/**
 * The global AI spend, in microdollars, against the $1 a day and $20 a month caps. A request reserves its estimated cost before the
 * model is called and settles at the real cost after, so a burst cannot overshoot a cap by the cost of everything in flight. A request
 * that would cross a cap is refused and turns AI off until the cap's period ends; a month's stop outlasts a day's.
 *
 * **Every method is synchronous on purpose**, as `CreditAccount`: the Durable Object runs one request at a time, so no `await` may
 * come between a read and its write. The Durable Object (`spend-ledger/SpendLedger.ts`) saves `toState()` after each call.
 */
export class SpendMeter {
  private readonly state: SpendMeterState;

  constructor(saved?: SpendMeterState) {
    this.state = structuredClone(
      saved ?? {
        day: NOTHING_YET,
        month: NOTHING_YET,
        dailyMicrodollars: 0,
        monthlyMicrodollars: 0,
        dailyStopped: false,
        monthlyStopped: false,
        alertsSent: [],
        reservations: {},
      },
    );
  }

  reserve(key: string, microdollars: number, now: number): SpendOutcome {
    this.startNewPeriods(now);

    const existing = this.state.reservations[key];
    if (existing) {
      return "reserved";
    }

    if (this.state.monthlyStopped || this.state.dailyStopped) {
      return "paused";
    }

    if (this.state.monthlyMicrodollars + microdollars > SPEND_CAPS.monthlyMicrodollars) {
      this.state.monthlyStopped = true;
      return "paused";
    }

    if (this.state.dailyMicrodollars + microdollars > SPEND_CAPS.dailyMicrodollars) {
      this.state.dailyStopped = true;
      return "paused";
    }

    this.state.dailyMicrodollars += microdollars;
    this.state.monthlyMicrodollars += microdollars;
    this.state.reservations[key] = {microdollars, held: true, day: this.state.day, month: this.state.month};

    return "reserved";
  }

  /** Replaces the request's estimate with what it really cost. Does nothing for a request already settled or one this meter does not know. */
  settle(key: string, microdollars: number, now: number): void {
    this.startNewPeriods(now);

    const reservation = this.state.reservations[key];
    if (!reservation?.held) {
      return;
    }

    const difference = microdollars - reservation.microdollars;
    if (reservation.day === this.state.day) {
      this.state.dailyMicrodollars += difference;
    }

    this.state.monthlyMicrodollars += difference;
    reservation.microdollars = microdollars;
    reservation.held = false;
  }

  /** Whether AI is on, and when it comes back if not. The one reader of the kill switch: the API and the UI both ask this. */
  status(now: number): AiStatus {
    this.startNewPeriods(now);

    if (this.state.monthlyStopped || this.state.monthlyMicrodollars >= SPEND_CAPS.monthlyMicrodollars) {
      return {on: false, returnsAt: nextUtcMonthStart(now)};
    }

    if (this.state.dailyStopped || this.state.dailyMicrodollars >= SPEND_CAPS.dailyMicrodollars) {
      return {on: false, returnsAt: nextUtcMidnight(now)};
    }

    return {on: true};
  }

  /** The alert percentages the month's spend has passed and that have not been marked sent, lowest first. It changes nothing, so an alert whose delivery failed is still due. */
  alertsDue(): number[] {
    return ALERT_PERCENTS.filter(percent => {
      return this.hasReached(percent) && !this.state.alertsSent.includes(percent);
    });
  }

  /** The month's spend so far in microdollars, reserved requests at their estimate and settled ones at their real cost. */
  spentThisMonth(): number {
    return this.state.monthlyMicrodollars;
  }

  /** Records that an alert's delivery succeeded, so it is no longer due this month. */
  markAlertSent(percent: number): void {
    if (!this.state.alertsSent.includes(percent)) {
      this.state.alertsSent.push(percent);
    }
  }

  toState(): SpendMeterState {
    return structuredClone(this.state);
  }

  /**
   * Whether the month has reached this share of its cap. The cap itself counts as reached once a request has been refused for crossing
   * it: that request is never reserved, so the spend stops short of the cap and could not otherwise reach it.
   */
  private hasReached(percent: number): boolean {
    if (percent >= FULL_BUDGET_PERCENT && this.state.monthlyStopped) {
      return true;
    }

    return this.state.monthlyMicrodollars * 100 >= SPEND_CAPS.monthlyMicrodollars * percent;
  }

  private startNewPeriods(now: number): void {
    const day = utcDay(now);
    if (day !== this.state.day) {
      this.state.day = day;
      this.state.dailyMicrodollars = 0;
      this.state.dailyStopped = false;
      this.forgetFinishedRequests();
    }

    const month = utcMonth(now);
    if (month !== this.state.month) {
      this.state.month = month;
      this.state.monthlyMicrodollars = 0;
      this.state.monthlyStopped = false;
      this.state.alertsSent = [];
      this.forgetRequestsOfEarlierMonths();
    }
  }

  private forgetFinishedRequests(): void {
    for (const [key, reservation] of Object.entries(this.state.reservations)) {
      if (!reservation.held) {
        delete this.state.reservations[key];
      }
    }
  }

  private forgetRequestsOfEarlierMonths(): void {
    for (const [key, reservation] of Object.entries(this.state.reservations)) {
      if (reservation.month !== this.state.month) {
        delete this.state.reservations[key];
      }
    }
  }
}
