/** The count the prompt box shows: how many characters are written, the most that may be, and whether the box says it is too long. */
export interface PromptCount {
  length: number;
  limit: number;
  over: boolean;
}
