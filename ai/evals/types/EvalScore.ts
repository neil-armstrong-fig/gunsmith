export interface EvalScore {
  key: string;
  // Binary on purpose: an evaluator either passes or it does not. Partial credit hides regressions in a small suite.
  score: 0 | 1;
  comment?: string;
}
