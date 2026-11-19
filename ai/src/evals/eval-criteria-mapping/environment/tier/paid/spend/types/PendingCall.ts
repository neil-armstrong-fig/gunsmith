/** A call the guard has seen start and not yet finish. */
export interface PendingCall {
  /** When it started, from the guard's clock. */
  startedAt: number;
  stage: string | undefined;
}
