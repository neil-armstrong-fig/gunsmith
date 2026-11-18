import {stepsOwed} from "@src/match/tick/StepsOwed";

const STEP = 1 / 60;

it("owes one step after one step's time", () => {
  expect(stepsOwed(0, STEP).steps).toBe(1);
});

it("owes nothing for less than a step, and carries the time over", () => {
  const first = stepsOwed(0, STEP / 2);
  const second = stepsOwed(first.leftoverSeconds, STEP / 2);

  expect(first.steps).toBe(0);
  expect(second.steps).toBe(1);
});

it("owes the steps a late timer missed", () => {
  expect(stepsOwed(0, STEP * 3.5).steps).toBe(3);
});

it("keeps the part of a step it did not play", () => {
  expect(stepsOwed(0, STEP * 3.5).leftoverSeconds).toBeCloseTo(STEP * 0.5, 9);
});

it("never owes more than a few steps, so a long stall is not played back at once", () => {
  const owed = stepsOwed(0, 10);

  expect(owed.steps).toBeLessThanOrEqual(6);
  expect(owed.leftoverSeconds).toBeLessThan(STEP);
});

it("owes nothing for time running backwards", () => {
  expect(stepsOwed(0, -1).steps).toBe(0);
});
