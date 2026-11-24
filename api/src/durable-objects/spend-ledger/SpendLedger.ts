import {DurableObject} from "cloudflare:workers";
import {deliverAlertEmail} from "@src/durable-objects/spend-ledger/alerts/email/DeliverAlertEmail";
import {sendDueAlerts} from "@src/durable-objects/spend-ledger/alerts/SendDueAlerts";
import {spendCapsFrom} from "@src/durable-objects/spend-ledger/caps/SpendCapsFrom";
import {SpendMeter} from "@src/durable-objects/spend-ledger/meter/SpendMeter";
import type {AiStatus} from "@src/durable-objects/spend-ledger/types/AiStatus";
import type {SpendCaps} from "@src/durable-objects/spend-ledger/types/SpendCaps";
import type {SpendMeterState} from "@src/durable-objects/spend-ledger/types/SpendMeterState";
import type {SpendOutcome} from "@src/durable-objects/spend-ledger/types/SpendOutcome";
import type {ApiWorkerEnvironment} from "@src/env/types/ApiWorkerEnvironment";

const METER_KEY = "meter";

/**
 * The global AI spend, one Durable Object for the whole game (always `env.SPEND.idFromName("spend")`). This is
 * the Workers runtime's edge and is kept to wiring (not unit tested): what is decided is in `SpendMeter`. Like `CreditLedger`, each call
 * loads the state, makes one change and saves it in one synchronous run with no `await`. The meter resets lazily when a call arrives in a
 * new day or month, so no alarm is needed for that.
 *
 * The 50/80/100 percent budget alerts are emailed from `alarm()`. A spend that makes one due schedules the alarm after its own change is
 * saved; the alarm sends each due alert and marks it sent only once it has gone (`sendDueAlerts`), so a failed send throws, the runtime
 * retries the alarm, and the alert stays due until it is delivered. With no `ALERT_TO_ADDRESS` set, nothing is scheduled or sent.
 *
 * The caps are the approved ceilings (`meter/SpendCaps`), which the optional vars `DAILY_SPEND_CAP_MICRODOLLARS` and
 * `MONTHLY_SPEND_CAP_MICRODOLLARS` can only lower (`caps/SpendCapsFrom`), so the shutdown drill can set a tiny budget on a running Worker.
 * They are read at each call, so the meter is rebuilt with them.
 */
export class SpendLedger extends DurableObject<ApiWorkerEnvironment> {
  async reserve(key: string, microdollars: number): Promise<SpendOutcome> {
    const outcome = this.change(meter => meter.reserve(key, microdollars, Date.now()));
    await this.scheduleAlertsIfDue();

    return outcome;
  }

  async settle(key: string, microdollars: number): Promise<void> {
    this.change(meter => {
      meter.settle(key, microdollars, Date.now());
    });
    await this.scheduleAlertsIfDue();
  }

  /** The one reader of the kill switch: the API and the UI both ask this. */
  status(): AiStatus {
    return this.change(meter => meter.status(Date.now()));
  }

  override async alarm(): Promise<void> {
    const toAddress = this.env.ALERT_TO_ADDRESS;
    if (!toAddress) {
      return;
    }

    const {percents, spentMicrodollars} = this.change(meter => ({
      percents: meter.alertsDue(),
      spentMicrodollars: meter.spentThisMonth(),
    }));

    await sendDueAlerts({
      percents,
      send: percent => {
        return deliverAlertEmail(this.env.ALERT_MAIL, {
          percent,
          spentMicrodollars,
          capMicrodollars: this.caps().monthlyMicrodollars,
          fromAddress: this.env.ALERT_FROM_ADDRESS,
          toAddress,
          messageId: crypto.randomUUID(),
          date: new Date(),
        });
      },
      markSent: percent => {
        this.change(meter => {
          meter.markAlertSent(percent);
        });
      },
    });
  }

  /** The caps in force: the approved ceilings, lowered by `DAILY_SPEND_CAP_MICRODOLLARS` and `MONTHLY_SPEND_CAP_MICRODOLLARS` when set (the shutdown drill). */
  private caps(): SpendCaps {
    return spendCapsFrom({
      daily: this.env.DAILY_SPEND_CAP_MICRODOLLARS,
      monthly: this.env.MONTHLY_SPEND_CAP_MICRODOLLARS,
    });
  }

  private async scheduleAlertsIfDue(): Promise<void> {
    if (!this.env.ALERT_TO_ADDRESS) {
      return;
    }

    const due = this.change(meter => meter.alertsDue());
    if (due.length === 0) {
      return;
    }

    const alreadyScheduled = await this.ctx.storage.getAlarm();
    if (alreadyScheduled === null) {
      await this.ctx.storage.setAlarm(Date.now());
    }
  }

  private change<Result>(use: (meter: SpendMeter) => Result): Result {
    const meter = new SpendMeter(this.ctx.storage.kv.get<SpendMeterState>(METER_KEY), this.caps());
    const result = use(meter);
    this.ctx.storage.kv.put(METER_KEY, meter.toState());

    return result;
  }
}
