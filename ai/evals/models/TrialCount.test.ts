import {trialCount} from "@evals/models/TrialCount";

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
