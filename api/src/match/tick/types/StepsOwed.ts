/** How many whole engine steps the clock owes the match, and the part of a step it did not play yet. */
export interface StepsOwed {
  steps: number;
  leftoverSeconds: number;
}
