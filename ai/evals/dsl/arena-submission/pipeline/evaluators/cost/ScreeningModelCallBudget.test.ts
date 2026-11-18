import {screeningModelCallBudget} from "@evals/dsl/arena-submission/pipeline/evaluators/cost/ScreeningModelCallBudget";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";

it("passes a moderation call for each of two prompts", () => {
  expect(screeningModelCallBudget(passingSubmissionInput({modelCalls: 2})).score).toBe(1);
});

it("passes a request the pre-check turned away at no cost", () => {
  expect(screeningModelCallBudget(passingSubmissionInput({modelCalls: 0})).score).toBe(1);
});

it("fails a third model call for two prompts", () => {
  expect(screeningModelCallBudget(passingSubmissionInput({modelCalls: 3})).comment).toBe(
    "3 model calls, allowed 2 (one moderation for each of 2 prompts, none for a built-in arena)",
  );
});

it("fails a model call for a built-in arena, which needs none", () => {
  const builtIn = {kind: "built-in" as const, playerId: "second", builtInName: "Open Room"};
  const input = passingSubmissionInput({modelCalls: 1}, {submissions: [builtIn]});

  expect(screeningModelCallBudget(input).comment).toBe(
    "1 model calls, allowed 0 (one moderation for each of 0 prompts, none for a built-in arena)",
  );
});
