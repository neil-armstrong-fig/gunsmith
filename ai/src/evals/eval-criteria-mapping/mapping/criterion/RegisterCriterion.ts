import {it} from "vitest";
import {runCriterion} from "@evals/eval-criteria-mapping/mapping/criterion/run/RunCriterion";
import type {RunCriterion} from "@evals/eval-criteria-mapping/types/RunCriterion";
import type {WhenContext} from "@evals/eval-criteria-mapping/mapping/types/WhenContext";

/** Registers one criterion as a test under its `when`: a `thenExpect` of the spec, or a check the DSL holds whatever is asked. It reads back in the report as `then <description>`. */
export function registerCriterion(whenContext: WhenContext, description: string, check: RunCriterion): void {
  it(`then ${description}`, async () => {
    await runCriterion(whenContext, description, check);
  });
}
