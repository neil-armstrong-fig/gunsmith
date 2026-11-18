import {survivorsWereSubmitted} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/SurvivorsWereSubmitted";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";

const PASSING_FIRST = {
  kind: "prompt" as const,
  playerId: "first",
  prompt: "an open arena with a ring of stone pillars",
};

it("passes when every survivor is a submission that was made, word for word", () => {
  expect(survivorsWereSubmitted(passingSubmissionInput()).score).toBe(1);
});

it("passes a built-in survivor that was submitted by name", () => {
  const builtIn = {kind: "built-in" as const, playerId: "second", builtInName: "Open Room"};
  const input = passingSubmissionInput({survivors: [builtIn]}, {submissions: [builtIn]});

  expect(survivorsWereSubmitted(input).score).toBe(1);
});

it("fails when a survivor's words are not what its player submitted", () => {
  const survivors = [{kind: "prompt" as const, playerId: "first", prompt: "an arena with pillars"}];

  expect(survivorsWereSubmitted(passingSubmissionInput({survivors})).comment).toBe(
    'the survivor from "first" is not a submission that was made, word for word',
  );
});

it("fails when a survivor is from a player who submitted nothing", () => {
  const survivors = [{kind: "prompt" as const, playerId: "third", prompt: "a maze"}];

  expect(survivorsWereSubmitted(passingSubmissionInput({survivors})).score).toBe(0);
});

it("fails when a survivor was also turned away", () => {
  const rejected = [{playerId: "second", reason: "Not an arena."}];

  expect(survivorsWereSubmitted(passingSubmissionInput({rejected})).comment).toBe(
    'the survivor from "second" was also turned away',
  );
});

it("fails when one player survives twice", () => {
  const survivors = [PASSING_FIRST, PASSING_FIRST];

  expect(survivorsWereSubmitted(passingSubmissionInput({survivors})).comment).toBe('the survivors name "first" twice');
});
