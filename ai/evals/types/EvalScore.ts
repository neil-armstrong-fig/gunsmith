/** One evaluator's verdict on one case. */
export interface EvalScore {
  key: string;
  /** Binary on purpose: an evaluator passes or it does not. Partial credit hides regressions in a small suite. */
  score: 0 | 1;
  comment?: string;
}
