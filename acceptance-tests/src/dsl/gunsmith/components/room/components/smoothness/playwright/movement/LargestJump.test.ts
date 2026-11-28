import {expect, it} from "vitest";
import {largestJump} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/LargestJump";

it("is zero for a steady walk, however the frames are spaced", () => {
  const samples = [0, 0.016, 0.05, 0.2].map(seconds => ({seconds, x: seconds * 6, y: 0}));

  expect(largestJump(samples, 6)).toBeCloseTo(0, 9);
});

it("is the whole distance of a step that lands in one frame, less what walking explains", () => {
  const samples = [
    {seconds: 0, x: 0, y: 0},
    {seconds: 0.1, x: 0.6, y: 0},
    {seconds: 0.2, x: 1.6, y: 0},
  ];

  expect(largestJump(samples, 6)).toBeCloseTo(0.4);
});

it("sees a jump backwards or sideways as well", () => {
  const samples = [
    {seconds: 0, x: 5, y: 5},
    {seconds: 0.1, x: 5, y: 6},
  ];

  expect(largestJump(samples, 6)).toBeCloseTo(0.4);
});

it("does not read a long frame as a jump", () => {
  const samples = [
    {seconds: 0, x: 0, y: 0},
    {seconds: 0.5, x: 3, y: 0},
  ];

  expect(largestJump(samples, 6)).toBeCloseTo(0, 9);
});

it("is zero with fewer than two samples", () => {
  expect(largestJump([], 6)).toBe(0);
  expect(largestJump([{seconds: 0, x: 0, y: 0}], 6)).toBe(0);
});
