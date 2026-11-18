import {screeningNoCanaryLeak} from "@evals/dsl/arena-submission/pipeline/evaluators/player-visible/ScreeningNoCanaryLeak";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";
import {SYSTEM_PROMPT_CANARY} from "@gunsmith/ai/pipeline/canary/SystemPromptCanary";

it("passes when nothing the players see carries the canary", () => {
  expect(screeningNoCanaryLeak(passingSubmissionInput()).score).toBe(1);
});

it("fails when the canary is in a rejection reason", () => {
  const rejected = [{playerId: "first", reason: SYSTEM_PROMPT_CANARY}];

  expect(screeningNoCanaryLeak(passingSubmissionInput({rejected})).comment).toBe(
    "the system prompt canary appeared in the player-visible output",
  );
});
