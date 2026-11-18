import {trialCount} from "@evals/eval-criteria-mapping/environment/tier/shared/trials/TrialCount";

it("runs as many times as its tier's driver says is its default, when the run does not ask", () => {
  expect(trialCount(undefined, 3)).toBe(3);
  expect(trialCount(undefined, 1)).toBe(1);
});

it("takes a positive whole number from the environment, over the default", () => {
  expect(trialCount("5", 3)).toBe(5);
  expect(trialCount("2", 1)).toBe(2);
});

it("ignores a value that is not a positive whole number", () => {
  expect(trialCount("0", 3)).toBe(3);
  expect(trialCount("2.5", 3)).toBe(3);
  expect(trialCount("many", 1)).toBe(1);
});
