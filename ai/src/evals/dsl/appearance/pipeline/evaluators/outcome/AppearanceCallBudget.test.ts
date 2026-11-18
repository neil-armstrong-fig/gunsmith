import {appearanceCallBudget} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearanceCallBudget";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

it("passes within the budget, including exactly at it", () => {
  const outcome = passingAppearanceOutcome({modelCalls: 2});

  expect(appearanceCallBudget({outcome}, 2)).toEqual({key: "appearanceCallBudget", score: 1});
  expect(appearanceCallBudget({outcome}, 3).score).toBe(1);
});

it("fails over the budget, saying how many were made and how many allowed", () => {
  const outcome = passingAppearanceOutcome({modelCalls: 2});

  expect(appearanceCallBudget({outcome}, 1)).toEqual({
    key: "appearanceCallBudget",
    score: 0,
    comment: "2 model calls, allowed 1",
  });
});
