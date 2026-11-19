import {describe} from "vitest";
import {evalRun} from "@evals/eval-criteria-mapping/mapping/run/CurrentEvalRun";
import type {DefineWhen} from "@evals/eval-criteria-mapping/types/DefineWhen";

/** A group of criteria inside a trial's scope. Vitest defines it after the scope's body, so it takes the place it sits in from where it was called. */
export function defineNestedWhen(description: string, define: DefineWhen): void {
  const nested = evalRun.nestedWhen(evalRun.requireWhen("when"), description);

  describe(`when ${description}`, () => {
    evalRun.runInScope(nested, () => define({weaponSmith: evalRun.weaponSmith}));
  });
}
