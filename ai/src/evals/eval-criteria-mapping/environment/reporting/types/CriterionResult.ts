import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

/** One `then` from one run: where it sits in the spec, whether it held in every trial, and the sentence that says why not. */
export interface CriterionResult {
  given: string;
  when: string;
  then: string;
  suite: EvalSuite;
  passed: boolean;
  comment?: string;
}
