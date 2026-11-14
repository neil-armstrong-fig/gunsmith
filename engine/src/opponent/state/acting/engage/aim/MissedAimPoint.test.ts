import {missedAimPoint} from "@gunsmith/engine/opponent/state/acting/engage/aim/MissedAimPoint";

it("aims straight at the target when the error is zero", () => {
  const point = missedAimPoint({x: 2, y: 3}, {x: 8, y: 3}, 0);

  expect(point.x).toBeCloseTo(8, 9);
  expect(point.y).toBeCloseTo(3, 9);
});

it("turns the aim to the left of the line to the target by a positive error", () => {
  const point = missedAimPoint({x: 0, y: 0}, {x: 10, y: 0}, Math.PI / 2);

  expect(point.x).toBeCloseTo(0, 9);
  expect(point.y).toBeCloseTo(10, 9);
});

it("turns the aim to the right of the line to the target by a negative error", () => {
  const point = missedAimPoint({x: 0, y: 0}, {x: 10, y: 0}, -Math.PI / 2);

  expect(point.x).toBeCloseTo(0, 9);
  expect(point.y).toBeCloseTo(-10, 9);
});

it("keeps the distance to the target, and turns about the shooter, not the origin", () => {
  const point = missedAimPoint({x: 5, y: 5}, {x: 8, y: 9}, 0.3);

  expect(Math.hypot(point.x - 5, point.y - 5)).toBeCloseTo(5, 9);
  expect(Math.atan2(point.y - 5, point.x - 5)).toBeCloseTo(Math.atan2(4, 3) + 0.3, 9);
});
