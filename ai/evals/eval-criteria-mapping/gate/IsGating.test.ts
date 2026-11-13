import {isGating} from "@evals/eval-criteria-mapping/gate/IsGating";

it("always gates a regression criterion", () => {
  expect(isGating("regression", undefined)).toBe(true);
  expect(isGating("regression", "regression")).toBe(true);
});

it("gates a capability criterion by default, so a new criterion is seen failing first", () => {
  expect(isGating("capability", undefined)).toBe(true);
});

it("stops gating a capability criterion when only regressions gate", () => {
  expect(isGating("capability", "regression")).toBe(false);
});

it("treats an unknown gate setting as no setting, rather than quietly gating less", () => {
  expect(isGating("capability", "nothing")).toBe(true);
});
