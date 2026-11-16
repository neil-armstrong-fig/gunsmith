import {FINAL_RING_RADIUS} from "@gunsmith/engine/ring/radius/FinalRingRadius";
import {radiusOfRing} from "@gunsmith/engine/ring/RadiusOfRing";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 0,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};

it("covers the whole arena until the ring starts", () => {
  expect(radiusOfRing(playedFor(0))).toBe(10);
  expect(radiusOfRing(playedFor(10))).toBe(10);
});

it("shrinks in a straight line while it closes", () => {
  const closingFraction = (10 - FINAL_RING_RADIUS) / 4;

  expect(radiusOfRing(playedFor(15))).toBeCloseTo(10 - closingFraction, 12);
  expect(radiusOfRing(playedFor(20))).toBeCloseTo(10 - 2 * closingFraction, 12);
});

it("ends at the final radius", () => {
  expect(radiusOfRing(playedFor(30))).toBe(FINAL_RING_RADIUS);
});

it("stays at the final radius afterwards", () => {
  expect(radiusOfRing(playedFor(90))).toBe(FINAL_RING_RADIUS);
});

it("never grows: an arena already smaller than the final radius keeps its radius", () => {
  expect(radiusOfRing(playedFor(30, 1))).toBe(1);
  expect(radiusOfRing(playedFor(20, 1))).toBe(1);
});

it("does not change the ring it is given", () => {
  const given = playedFor(15);
  radiusOfRing(given);

  expect(given).toEqual(playedFor(15));
});

it("is the same for the same clock, so a replay agrees", () => {
  expect(radiusOfRing(playedFor(17.3))).toBe(radiusOfRing(playedFor(17.3)));
});

function playedFor(roundSeconds: number, startRadius = 10): Ring {
  return {...ring, roundSeconds, startRadius};
}
