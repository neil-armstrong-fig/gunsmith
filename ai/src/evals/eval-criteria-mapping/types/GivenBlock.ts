import type {DefineGiven} from "@evals/eval-criteria-mapping/types/DefineGiven";

/**
 * `given` for a feature whose criteria must hold (regressions), and `given.inProgress` for one still being built: every `when`
 * inside it is tracked and reported but, under `EVAL_GATE=regression`, only warned about. A comment above an `inProgress` block
 * says why it is, and the tag comes off (it becomes a plain `given`) when the feature is done.
 */
export interface GivenBlock {
  (description: string, define: DefineGiven): void;
  inProgress(description: string, define: DefineGiven): void;
}
