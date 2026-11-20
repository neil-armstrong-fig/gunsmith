/** What the workshop says about the current prompt. */
export interface PromptReadout {
  /** How many characters are written (UTF-16 units, as the pre-check counts them). */
  length: number;
  limit: number;
  /** Whether there are more characters than the limit allows. */
  over: boolean;
  /** Whether Make may be pressed: something is written, and not too much. */
  canMake: boolean;
}
