import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import type {SpendCaps} from "@src/durable-objects/spend-ledger/types/SpendCaps";
import type {SpendCapSettings} from "@src/durable-objects/spend-ledger/caps/types/SpendCapSettings";

const WHOLE_NUMBER = /^\d+$/;

/**
 * The caps in force: the approved ceilings (`SPEND_CAPS`), each lowered to the value its setting gives, so the shutdown drill can set a tiny
 * budget on a running Worker without a code change. **A setting can only lower a cap.** One that is absent, is not a whole number of
 * microdollars or is above its ceiling leaves the ceiling in force, so a typo or a stray var can never let the game spend more than approved.
 */
export function spendCapsFrom(settings: SpendCapSettings): SpendCaps {
  return {
    dailyMicrodollars: loweredCap(settings.daily, SPEND_CAPS.dailyMicrodollars),
    monthlyMicrodollars: loweredCap(settings.monthly, SPEND_CAPS.monthlyMicrodollars),
  };
}

function loweredCap(setting: string | undefined, ceiling: number): number {
  if (setting === undefined || !WHOLE_NUMBER.test(setting)) {
    return ceiling;
  }

  const asked = Number(setting);
  if (asked > ceiling) {
    return ceiling;
  }

  return asked;
}
