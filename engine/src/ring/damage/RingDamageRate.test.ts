import {MAXIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MaximumRingDamage";
import {MINIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MinimumRingDamage";
import {ringDamageRate} from "@gunsmith/engine/ring/damage/RingDamageRate";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 0,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};

function playedFor(roundSeconds: number): Ring {
  return {...ring, roundSeconds};
}

it("is nothing until the ring starts to close", () => {
  expect(ringDamageRate(playedFor(0))).toBe(0);
  expect(ringDamageRate(playedFor(10))).toBe(0);
});

it("starts at the minimum the moment the ring starts to close", () => {
  expect(ringDamageRate(playedFor(10.0001))).toBeCloseTo(MINIMUM_RING_DAMAGE_PER_SECOND, 2);
});

it("rises in a straight line while the ring closes", () => {
  const middle = (MINIMUM_RING_DAMAGE_PER_SECOND + MAXIMUM_RING_DAMAGE_PER_SECOND) / 2;

  expect(ringDamageRate(playedFor(20))).toBeCloseTo(middle, 12);
});

it("is at the maximum once the ring has closed", () => {
  expect(ringDamageRate(playedFor(30))).toBe(MAXIMUM_RING_DAMAGE_PER_SECOND);
});

it("stays at the maximum afterwards, so someone always dies in the end", () => {
  expect(ringDamageRate(playedFor(600))).toBe(MAXIMUM_RING_DAMAGE_PER_SECOND);
});
