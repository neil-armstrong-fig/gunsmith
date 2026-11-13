import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {strafeDirection} from "@gunsmith/engine/opponent/steering/StrafeDirection";

it("goes sideways to the line to the target, at the opponent's share of full speed", () => {
  const direction = strafeDirection({from: {x: 0, y: 0}, to: {x: 10, y: 0}, side: 1});

  expect(direction.x).toBeCloseTo(0, 9);
  expect(direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("goes the other way on the other side", () => {
  const direction = strafeDirection({from: {x: 0, y: 0}, to: {x: 10, y: 0}, side: -1});

  expect(direction.x).toBeCloseTo(0, 9);
  expect(direction.y).toBeCloseTo(-DIFFICULTY.speedShare, 9);
});

it("goes sideways whichever way the target lies", () => {
  const direction = strafeDirection({from: {x: 2, y: 2}, to: {x: 5, y: 6}, side: 1});

  expect(direction.x * 3 + direction.y * 4).toBeCloseTo(0, 9);
  expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.x).toBeLessThan(0);
});

it("stands still when it is on top of the target, with no line to go sideways to", () => {
  expect(strafeDirection({from: {x: 1, y: 1}, to: {x: 1, y: 1}, side: 1})).toEqual({x: 0, y: 0});
});

it("goes east or west, by side, when the target lies due north", () => {
  const left = strafeDirection({from: {x: 0, y: 0}, to: {x: 0, y: 10}, side: 1});
  const right = strafeDirection({from: {x: 0, y: 0}, to: {x: 0, y: 10}, side: -1});

  expect(left.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
  expect(left.y).toBeCloseTo(0, 9);
  expect(right.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(right.y).toBeCloseTo(0, 9);
});
