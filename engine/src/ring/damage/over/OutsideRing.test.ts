import {outsideRing} from "@gunsmith/engine/ring/damage/over/OutsideRing";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 0,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};
const closed: Ring = {...ring, roundSeconds: 100};

it("is not outside while the ring covers the arena", () => {
  expect(outsideRing(ring, {x: 12, y: 5})).toBe(false);
});

it("is outside beyond the edge of the ring that has closed", () => {
  expect(outsideRing(closed, {x: 5, y: 7.01})).toBe(true);
  expect(outsideRing(closed, {x: 2.9, y: 5})).toBe(true);
});

it("is inside within the edge, on any side of the centre", () => {
  expect(outsideRing(closed, {x: 5, y: 6.9})).toBe(false);
  expect(outsideRing(closed, {x: 3.1, y: 5})).toBe(false);
  expect(outsideRing(closed, {x: 5, y: 5})).toBe(false);
});

it("counts the edge itself as inside", () => {
  expect(outsideRing(closed, {x: 5, y: 7})).toBe(false);
});

it("measures the distance on both axes, not along one", () => {
  expect(outsideRing(closed, {x: 6.4, y: 6.4})).toBe(false);
  expect(outsideRing(closed, {x: 6.5, y: 6.5})).toBe(true);
});
