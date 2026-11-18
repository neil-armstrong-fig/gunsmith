import {statusFollowsSurvivors} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/StatusFollowsSurvivors";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";

const PASSING_FIRST = {
  kind: "prompt" as const,
  playerId: "first",
  prompt: "an open arena with a ring of stone pillars",
};
const PASSING_SECOND = {
  kind: "prompt" as const,
  playerId: "second",
  prompt: "a fortress with a raised keep reached by one stair",
};

const FIRST_REJECTED = [{playerId: "first", reason: "Not an arena."}];

it("passes two survivors left for the players to pick between", () => {
  expect(statusFollowsSurvivors(passingSubmissionInput()).score).toBe(1);
});

it("passes one survivor going forward by default", () => {
  const input = passingSubmissionInput({
    status: "only-submission",
    survivors: [PASSING_SECOND],
    rejected: FIRST_REJECTED,
  });

  expect(statusFollowsSurvivors(input).score).toBe(1);
});

it("passes no survivors leaving nothing", () => {
  const rejected = [...FIRST_REJECTED, {playerId: "second", reason: "Not an arena."}];

  expect(statusFollowsSurvivors(passingSubmissionInput({status: "none", survivors: [], rejected})).score).toBe(1);
});

it("fails a lone survivor that is left for the players to pick between", () => {
  const input = passingSubmissionInput({
    survivors: [PASSING_SECOND],
    rejected: FIRST_REJECTED,
  });

  expect(statusFollowsSurvivors(input).comment).toBe(
    '1 survivors, so the status is "only-submission", but it says "players-pick"',
  );
});

it("fails two survivors that are said to go forward by default", () => {
  expect(statusFollowsSurvivors(passingSubmissionInput({status: "only-submission"})).score).toBe(0);
});

it("fails when a submission is neither a survivor nor turned away", () => {
  const input = passingSubmissionInput({
    status: "only-submission",
    survivors: [PASSING_FIRST],
  });

  expect(statusFollowsSurvivors(input).comment).toBe(
    "2 submissions but 1 survived and 0 were turned away, so one is unaccounted for",
  );
});
