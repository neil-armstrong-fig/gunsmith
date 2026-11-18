import {DurableObject} from "cloudflare:workers";
import {SpendMeter} from "@src/ai/spend/meter/SpendMeter";
import type {AiStatus} from "@src/ai/spend/types/AiStatus";
import type {SpendMeterState} from "@src/ai/spend/types/SpendMeterState";
import type {SpendOutcome} from "@src/ai/spend/types/SpendOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";

const METER_KEY = "meter";

/**
 * The global AI spend, one Durable Object for the whole game (always `env.SPEND.idFromName("spend")`). This is
 * the Workers runtime's edge and is kept to wiring (not unit tested): what is decided is in `SpendMeter`. Like `CreditLedger`, each call
 * loads the state, makes one change and saves it in one synchronous run with no `await`. The meter resets lazily when a call arrives in a
 * new day or month, so no alarm is needed for that; sending the alerts it hands out (`takeAlerts`) is not built yet.
 */
export class SpendLedger extends DurableObject<ApiEnvironment> {
  reserve(key: string, microdollars: number): SpendOutcome {
    return this.change(meter => meter.reserve(key, microdollars, Date.now()));
  }

  settle(key: string, microdollars: number): void {
    this.change(meter => {
      meter.settle(key, microdollars, Date.now());
    });
  }

  /** The one reader of the kill switch: the API and the UI both ask this. */
  status(): AiStatus {
    return this.change(meter => meter.status(Date.now()));
  }

  takeAlerts(): number[] {
    return this.change(meter => meter.takeAlerts());
  }

  private change<Result>(use: (meter: SpendMeter) => Result): Result {
    const meter = new SpendMeter(this.ctx.storage.kv.get<SpendMeterState>(METER_KEY));
    const result = use(meter);
    this.ctx.storage.kv.put(METER_KEY, meter.toState());

    return result;
  }
}
