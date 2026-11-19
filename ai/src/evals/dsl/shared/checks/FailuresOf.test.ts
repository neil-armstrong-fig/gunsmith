import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

it("has no failure when every check holds", () => {
  expect(failuresOf("answer", [() => ({key: "first", score: 1}), () => ({key: "second", score: 1})])).toEqual([]);
});

it("says, for each check that failed, which it was and why", () => {
  const failures = failuresOf("answer", [
    () => ({key: "withinCaps", score: 0, comment: "2000 damage per second is over 150"}),
    () => ({key: "nodePath", score: 1}),
    () => ({key: "nameHygiene", score: 0, comment: "name has markup"}),
  ]);

  expect(failures).toEqual(["withinCaps: 2000 damage per second is over 150", "nameHygiene: name has markup"]);
});

it("names a failed check that gave no reason", () => {
  expect(failuresOf("answer", [() => ({key: "nodePath", score: 0})])).toEqual(["nodePath"]);
});

it("hands each check the answer", () => {
  const seen: string[] = [];
  const check = (answer: string): EvalScore => {
    seen.push(answer);

    return {key: "k", score: 1};
  };

  failuresOf("the answer", [check, check]);

  expect(seen).toEqual(["the answer", "the answer"]);
});
