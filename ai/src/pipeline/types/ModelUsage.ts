/** What model calls cost in tokens, as the model reported it (never an estimate); zero when the model reported nothing. */
export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
}
