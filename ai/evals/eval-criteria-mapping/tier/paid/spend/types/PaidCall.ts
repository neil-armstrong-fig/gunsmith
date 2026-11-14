/** What one finished paid call used and why it stopped (`max_tokens` means the answer was cut off). */
export interface PaidCall {
  inputTokens: number;
  outputTokens: number;
  /** The provider's stop reason, or `undefined` when the reply carried none. */
  stopReason: string | undefined;
}
