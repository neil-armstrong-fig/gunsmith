import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";

it("walks straight at the goal at the opponent's share of full speed", () => {
  const direction = walkToward({x: 0, y: 0}, {x: 10, y: 0});

  expect(direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.y).toBeCloseTo(0, 9);
});

it("walks the same speed whichever way the goal lies", () => {
  const direction = walkToward({x: 2, y: 2}, {x: 5, y: 6});

  expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.x / direction.y).toBeCloseTo(3 / 4, 9);
});

it("stands still once it is within the arrival radius", () => {
  expect(walkToward({x: 0, y: 0}, {x: DIFFICULTY.arrivalRadius - 0.01, y: 0})).toEqual({x: 0, y: 0});
});

it("keeps walking just outside the arrival radius", () => {
  expect(walkToward({x: 0, y: 0}, {x: DIFFICULTY.arrivalRadius + 0.01, y: 0}).x).toBeGreaterThan(0);
});
