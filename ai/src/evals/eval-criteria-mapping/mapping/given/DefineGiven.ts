import {describe} from "vitest";
import {evalRun} from "@evals/eval-criteria-mapping/mapping/run/CurrentEvalRun";
import type {DefineGiven} from "@evals/eval-criteria-mapping/types/DefineGiven";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

/** Every `when` in a `given` takes its suite from it: a feature is in progress as a whole, never one scenario at a time. */
export function defineGiven(suite: EvalSuite, description: string, define: DefineGiven): void {
  describe(suite === "inProgress" ? `given (in progress) ${description}` : `given ${description}`, () => {
    evalRun.beginGiven(description, suite);
    define();
  });
}
