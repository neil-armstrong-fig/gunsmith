import {describe} from "vitest";
import {evalRun} from "@evals/eval-criteria-mapping/mapping/run/CurrentEvalRun";
import {defineNestedWhen} from "@evals/eval-criteria-mapping/mapping/when/nested-when/DefineNestedWhen";
import type {DefineWhen} from "@evals/eval-criteria-mapping/types/DefineWhen";

/** A top-level `when` is a request: it must run it in a scope of each trial. Inside a trial's scope it is a group of criteria instead. */
export function defineWhen(description: string, define: DefineWhen): void {
  if (evalRun.isInTrial()) {
    defineNestedWhen(description, define);

    return;
  }

  describe(`when ${description}`, () => {
    evalRun.beginWhen(description);
    define({weaponSmith: evalRun.weaponSmith});
    evalRun.endWhen();
  });
}
