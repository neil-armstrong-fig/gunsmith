import {statusIn} from "@evals/dsl/appearance/pipeline/evaluators/outcome/StatusIn";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

it("passes when the outcome ended in one of the statuses", () => {
  const outcome = passingAppearanceOutcome({status: "completed"});

  expect(statusIn({outcome}, ["valid", "completed"])).toEqual({key: "statusIn", score: 1});
});

it("fails, saying what it was and what was expected, when it ended in another", () => {
  const outcome = passingAppearanceOutcome({status: "fallback"});

  expect(statusIn({outcome}, ["valid", "completed"])).toEqual({
    key: "statusIn",
    score: 0,
    comment: "expected valid or completed, got fallback",
  });
});
