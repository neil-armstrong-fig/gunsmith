/** A criterion that holds whatever was asked: the DSL says what it is and how to check it, and the mapping reports it under every `when`. */
export interface StandingCriterion {
  /** Reads back in the report as `then <description>`. */
  description: string;
  /** Checks it against the answers of the latest `ask`, failing with one sentence like any `expect` method. */
  expect(): void;
}
