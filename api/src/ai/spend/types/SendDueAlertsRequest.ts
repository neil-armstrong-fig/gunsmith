/** What `sendDueAlerts` needs: the alerts to deliver, how to deliver one, and what to record once one is delivered. */
export interface SendDueAlertsRequest {
  percents: readonly number[];
  send(percent: number): Promise<void>;
  markSent(percent: number): void;
}
