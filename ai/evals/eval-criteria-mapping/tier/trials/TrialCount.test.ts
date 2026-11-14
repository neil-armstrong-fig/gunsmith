import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";

it("runs the local tier three times by default, since a local model is not fully repeatable", () => {
  expect(trialCount("local", undefined)).toBe(3);
});

it("runs the fake and paid tiers once by default (the fake one is deterministic, the paid one costs money)", () => {
  expect(trialCount("fake", undefined)).toBe(1);
  expect(trialCount("paid", undefined)).toBe(1);
});

it("takes a positive whole number from the environment", () => {
  expect(trialCount("local", "5")).toBe(5);
});

it("ignores a value that is not a positive whole number", () => {
  expect(trialCount("local", "0")).toBe(3);
  expect(trialCount("local", "2.5")).toBe(3);
  expect(trialCount("local", "many")).toBe(3);
});

it("runs a local tier as many times as the caller says is its default, for a slow case", () => {
  expect(trialCount("local", undefined, 1)).toBe(1);
  expect(trialCount("local", "many", 1)).toBe(1);
});

it("lets the environment override that default, and leaves the other tiers at one", () => {
  expect(trialCount("local", "4", 1)).toBe(4);
  expect(trialCount("fake", undefined, 2)).toBe(1);
});
