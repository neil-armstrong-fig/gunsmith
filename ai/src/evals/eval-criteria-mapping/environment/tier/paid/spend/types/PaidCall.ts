/** What one finished paid call used, why it stopped (`max_tokens` means the answer was cut off), which stage made it and how long it took. */
export interface PaidCall {
  inputTokens: number;
  outputTokens: number;
  /** The provider's stop reason, or `undefined` when the reply carried none. */
  stopReason: string | undefined;
  /** The pipeline's graph node that made the call (`moderation`, `generate`, `repair`, `draw`), or `undefined` outside a graph. */
  stage: string | undefined;
  /** From the call starting to it finishing, in milliseconds, or `undefined` when the guard never saw it start. */
  latencyMs: number | undefined;
}
