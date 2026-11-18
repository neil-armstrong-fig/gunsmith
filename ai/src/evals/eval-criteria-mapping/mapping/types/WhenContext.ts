import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

/** The `when` whose body is being defined: where a `beforeAll` and a `then` find their suite and their place in the report. */
export interface WhenContext {
  given: string;
  description: string;
  suite: EvalSuite;
}
