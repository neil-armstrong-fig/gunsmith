import {expect, it} from "vitest";
import {fastestMovement} from "@src/dsl/gunsmith/components/room/playwright/wire/movement/FastestMovement";

it("is the speed of a steady walk", () => {
  const samples = [0, 0.1, 0.2, 0.3].map(seconds => ({seconds, x: seconds * 6, y: 0}));

  expect(fastestMovement(samples)).toBeCloseTo(6);
});

it("sees a jump, however brief", () => {
  const samples = [
    {seconds: 0, x: 0, y: 0},
    {seconds: 0.05, x: 0.3, y: 0},
    {seconds: 0.1, x: 1.2, y: 0},
  ];

  expect(fastestMovement(samples)).toBeCloseTo(12);
});

it("judges by measured time, so a long gap between two samples is not a jump", () => {
  const samples = [
    {seconds: 0, x: 0, y: 0},
    {seconds: 0.5, x: 3, y: 0},
  ];

  expect(fastestMovement(samples)).toBeCloseTo(6);
});

it("is zero without two samples a tenth of a second apart", () => {
  expect(fastestMovement([{seconds: 0, x: 0, y: 0}])).toBe(0);
  expect(
    fastestMovement([
      {seconds: 0, x: 0, y: 0},
      {seconds: 0.05, x: 5, y: 0},
    ]),
  ).toBe(0);
});
