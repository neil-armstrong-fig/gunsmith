import type {SendDueAlertsRequest} from "@src/ai/spend/types/SendDueAlertsRequest";

/**
 * Delivers each due alert in turn and marks it sent only after its delivery has finished, so a delivery that fails is still due and is
 * tried again. A failure stops the run (the alerts after it are not sent out of order) and is rethrown for the Durable Object's alarm
 * to retry.
 */
export async function sendDueAlerts({percents, send, markSent}: SendDueAlertsRequest): Promise<void> {
  for (const percent of percents) {
    await send(percent);
    markSent(percent);
  }
}
