/** What a player asked for: the words they typed. Untrusted text, which the pipeline treats as data, never as instructions. */
export interface GenerateWeaponInput {
  prompt: string;
  /**
   * Cancels the request: no stage starts once it has aborted, the model call in flight is told to stop, and the request rejects
   * instead of answering. The route's time limit passes `AbortSignal.timeout(...)`, so the work stops as well as the waiting.
   */
  signal?: AbortSignal;
}
