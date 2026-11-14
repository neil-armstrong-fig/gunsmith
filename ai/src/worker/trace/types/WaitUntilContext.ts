/** The one method of Workers' ExecutionContext the spikes use (avoids a workers-types dependency). */
export interface WaitUntilContext {
  waitUntil(promise: Promise<unknown>): void;
}
