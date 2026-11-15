import {advanceRing} from "@gunsmith/engine/ring/AdvanceRing";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 2,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 45, closingSeconds: 30},
};

it("adds the seconds played to the round's clock", () => {
  expect(advanceRing(ring, 0.5).roundSeconds).toBe(2.5);
});

it("leaves the centre, the radius it began with and the timing as they were", () => {
  expect(advanceRing(ring, 0.5)).toEqual({...ring, roundSeconds: 2.5});
});

it("does not change the ring it is given", () => {
  const given = {...ring};
  advanceRing(given, 1);

  expect(given).toEqual(ring);
});
