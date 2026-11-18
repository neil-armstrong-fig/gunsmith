import {outputTokenBudget} from "@evals/dsl/appearance/pipeline/evaluators/outcome/OutputTokenBudget";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

it("passes within the budget, including exactly at it", () => {
  const outcome = passingAppearanceOutcome({usage: {inputTokens: 100, outputTokens: 1500}});

  expect(outcome.usage.outputTokens).toBe(1500);
  expect(outputTokenBudget({outcome}, 1500)).toEqual({key: "outputTokenBudget", score: 1});
});

it("fails over the budget, saying how many tokens the model wrote and how many were allowed", () => {
  const outcome = passingAppearanceOutcome({usage: {inputTokens: 100, outputTokens: 1501}});

  expect(outputTokenBudget({outcome}, 1500)).toEqual({
    key: "outputTokenBudget",
    score: 0,
    comment: "1501 output tokens, allowed 1500",
  });
});

it("counts only what the model wrote, not what it was sent", () => {
  const outcome = passingAppearanceOutcome({usage: {inputTokens: 9000, outputTokens: 10}});

  expect(outputTokenBudget({outcome}, 100).score).toBe(1);
});
