import {pushOnce} from "@gunsmith/engine/movement/pushing/PushOnce";

const RADIUS = 0.4;
// Blocked tiles: the column x = 3, and the row y = 3.
const column = (tileX: number): boolean => tileX === 3;
const tileTwo = (tileX: number): boolean => tileX === 2;
const row = (_tileX: number, tileY: number): boolean => tileY === 3;
const rowTwo = (_tileX: number, tileY: number): boolean => tileY === 2;
const columnAndRow = (tileX: number, tileY: number): boolean => tileX === 3 || tileY === 3;

it("returns the very same point when nothing is in reach, so a caller can tell nothing moved", () => {
  const centre = {x: 1.5, y: 1.5};

  expect(pushOnce(column, centre, RADIUS)).toBe(centre);
});

it("pushes a circle clear of one blocked tile", () => {
  const pushed = pushOnce(column, {x: 2.8, y: 1.5}, RADIUS);

  expect(pushed.x).toBeCloseTo(3 - RADIUS, 9);
  expect(pushed.y).toBe(1.5);
});

it("reaches a blocked tile on the circle's east side that is not under its centre", () => {
  expect(pushOnce(column, {x: 2.7, y: 1.5}, RADIUS).x).toBeCloseTo(3 - RADIUS, 9);
});

it("reaches a blocked tile on the circle's west side that is not under its centre", () => {
  expect(pushOnce(tileTwo, {x: 3.2, y: 1.5}, RADIUS).x).toBeCloseTo(3 + RADIUS, 9);
});

it("reaches blocked tiles to the south and the north of the circle", () => {
  expect(pushOnce(row, {x: 1.5, y: 2.7}, RADIUS).y).toBeCloseTo(3 - RADIUS, 9);
  expect(pushOnce(rowTwo, {x: 1.5, y: 3.2}, RADIUS).y).toBeCloseTo(3 + RADIUS, 9);
});

it("adds up the pushes of two blocked tiles it overlaps in the one pass", () => {
  const pushed = pushOnce(columnAndRow, {x: 2.8, y: 2.8}, RADIUS);

  expect(pushed.x).toBeLessThan(2.8);
  expect(pushed.y).toBeLessThan(2.8);
});

it("does not ask about tiles the circle cannot reach", () => {
  const asked: string[] = [];

  pushOnce((tileX, tileY) => asked.push(`${tileX},${tileY}`) < 0, {x: 5.5, y: 5.5}, RADIUS);

  expect(asked.sort()).toEqual(["5,5"]);
});

it("judges each blocked tile from where the earlier ones have already pushed the circle, so two tiles do not push it twice over", () => {
  const pushed = pushOnce(columnAndRow, {x: 2.8, y: 2.8}, RADIUS);

  expect(pushed.x).toBeCloseTo(3 - RADIUS, 9);
  expect(pushed.y).toBeCloseTo(3 - RADIUS, 9);
});
