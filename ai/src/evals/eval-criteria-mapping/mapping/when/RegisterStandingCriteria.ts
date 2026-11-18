import {registerCriterion} from "@evals/eval-criteria-mapping/mapping/criterion/RegisterCriterion";
import type {TrackedFixtures} from "@evals/eval-criteria-mapping/mapping/when/fixtures/TrackedFixtures";
import type {WhenContext} from "@evals/eval-criteria-mapping/mapping/types/WhenContext";

/** What holds whatever was asked is each DSL's to say; the mapping only reports it under every `when`, after the test's own criteria. */
export function registerStandingCriteria(whenContext: WhenContext, tracked: TrackedFixtures): void {
  for (const criterion of tracked.standingCriteria()) {
    registerCriterion(whenContext, criterion.description, () => criterion.expect());
  }
}
