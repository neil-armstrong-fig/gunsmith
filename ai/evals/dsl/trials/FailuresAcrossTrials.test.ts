import {failuresAcrossTrials} from "@evals/dsl/trials/FailuresAcrossTrials";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

function isEven(input: number): EvalScore {
  if (input % 2 === 0) {
    return {key: "isEven", score: 1};
  }

  return {key: "isEven", score: 0, comment: `${input} is odd`};
}

it("is nothing when the check held in every trial", () => {
  expect(failuresAcrossTrials([2, 4, 6], isEven)).toEqual([]);
});

it("says, once, how many trials it failed in and why", () => {
  expect(failuresAcrossTrials([2, 3, 5], isEven)).toEqual(["isEven: failed in 2 of 3 trials: 3 is odd"]);
});

it("is nothing for no trials", () => {
  expect(failuresAcrossTrials([], isEven)).toEqual([]);
});
