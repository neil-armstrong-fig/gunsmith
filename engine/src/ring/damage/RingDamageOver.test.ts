import {ringDamageOver} from "@gunsmith/engine/ring/damage/RingDamageOver";
import {ringDamageRate} from "@gunsmith/engine/ring/damage/RingDamageRate";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 40,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};
const INSIDE = {x: 5, y: 6};
const OUTSIDE = {x: 5, y: 9};

it("is the rate for the seconds, for a fighter outside the ring", () => {
  expect(ringDamageOver(ring, OUTSIDE, 0.5)).toBeCloseTo(ringDamageRate(ring) * 0.5, 12);
});

it("is nothing for a fighter inside it", () => {
  expect(ringDamageOver(ring, INSIDE, 1)).toBe(0);
});

it("is nothing for a fighter on the edge itself: the edge is safe ground", () => {
  const onTheEdge = {x: 5, y: 5 + 2};

  expect(ringDamageOver(ring, onTheEdge, 1)).toBe(0);
});

it("is something a hair beyond the edge", () => {
  expect(ringDamageOver(ring, {x: 5, y: 7.001}, 1)).toBeGreaterThan(0);
});

it("is nothing before the ring starts, wherever a fighter stands", () => {
  expect(ringDamageOver({...ring, roundSeconds: 3}, {x: 100, y: 100}, 1)).toBe(0);
});

it("is more as the ring closes, for a fighter who stays outside", () => {
  const early = ringDamageOver({...ring, roundSeconds: 20}, {x: 5, y: 9}, 1);
  const late = ringDamageOver({...ring, roundSeconds: 28}, {x: 5, y: 9}, 1);

  expect(late).toBeGreaterThan(early);
});

it("is none for no time", () => {
  expect(ringDamageOver(ring, OUTSIDE, 0)).toBe(0);
});
