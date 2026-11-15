import {isGating} from "@evals/eval-criteria-mapping/gate/IsGating";

it("always gates a regression criterion", () => {
  expect(isGating("regression", undefined)).toBe(true);
  expect(isGating("regression", "regression")).toBe(true);
});

it("gates an in-progress criterion by default, so a new criterion is seen failing first", () => {
  expect(isGating("inProgress", undefined)).toBe(true);
});

it("stops gating an in-progress criterion when only regressions gate", () => {
  expect(isGating("inProgress", "regression")).toBe(false);
});

it("treats an unknown gate setting as no setting, rather than quietly gating less", () => {
  expect(isGating("inProgress", "nothing")).toBe(true);
});
