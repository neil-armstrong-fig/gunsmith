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

it("is the normal rate times the damage scale the ring was given", () => {
  const scaled: Ring = {...playedFor(20), timing: {...ring.timing, damageScale: 10}};

  expect(ringDamageRate(scaled)).toBeCloseTo(ringDamageRate(playedFor(20)) * 10, 12);
});

it("scales the maximum too, so a stronger ring ends the round sooner", () => {
  const scaled: Ring = {...playedFor(600), timing: {...ring.timing, damageScale: 3}};

  expect(ringDamageRate(scaled)).toBe(MAXIMUM_RING_DAMAGE_PER_SECOND * 3);
});

it("is still nothing before the ring starts, however strong it is", () => {
  const scaled: Ring = {...playedFor(5), timing: {...ring.timing, damageScale: 10}};

  expect(ringDamageRate(scaled)).toBe(0);
});

it("is the normal rate for a damage scale of one", () => {
  const scaled: Ring = {...playedFor(20), timing: {...ring.timing, damageScale: 1}};

  expect(ringDamageRate(scaled)).toBe(ringDamageRate(playedFor(20)));
});

function playedFor(roundSeconds: number): Ring {
  return {...ring, roundSeconds};
}
