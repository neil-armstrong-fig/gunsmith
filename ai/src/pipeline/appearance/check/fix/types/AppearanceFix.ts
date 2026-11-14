/**
 * What a rewrite step hands on: the candidate after the step (never the one it was given: a new value), and one short label for
 * each kind of change it made, so a caller can tell the model's own answer from one the code finished.
 */
export interface AppearanceFix {
  candidate: unknown;
  changes: string[];
}
