import {survivorIs} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/SurvivorIs";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";

const SECOND = {
  kind: "prompt" as const,
  playerId: "second",
  prompt: "a fortress with a raised keep reached by one stair",
};

it("passes when the one survivor is the prompt expected", () => {
  const input = passingSubmissionInput({status: "only-submission", survivors: [SECOND]});

  expect(survivorIs(input, "a fortress with a raised keep reached by one stair").score).toBe(1);
});

it("fails when the one survivor is another prompt", () => {
  const input = passingSubmissionInput({status: "only-submission", survivors: [SECOND]});

  expect(survivorIs(input, "a box").comment).toBe(
    'expected "a box" to be the one survivor, but "a fortress with a raised keep reached by one stair" was',
  );
});

it("fails when two survived", () => {
  expect(survivorIs(passingSubmissionInput(), "a box").comment).toBe(
    'expected "a box" to be the one survivor, but 2 survived',
  );
});

it("fails when the one survivor is a built-in arena, which has no prompt", () => {
  const builtIn = {kind: "built-in" as const, playerId: "second", builtInName: "Open Room"};
  const input = passingSubmissionInput({status: "only-submission", survivors: [builtIn]});

  expect(survivorIs(input, "a box").comment).toBe(
    'expected "a box" to be the one survivor, but built-in arena "Open Room" was',
  );
});
