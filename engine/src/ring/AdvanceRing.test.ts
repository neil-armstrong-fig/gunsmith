import {advanceRing} from "@gunsmith/engine/ring/AdvanceRing";

it("adds the seconds played to the round's clock", () => {
  expect(advanceRing({roundSeconds: 2}, 0.5)).toEqual({roundSeconds: 2.5});
});

it("does not change the ring it is given", () => {
  const ring = {roundSeconds: 2};

  advanceRing(ring, 1);

  expect(ring).toEqual({roundSeconds: 2});
});
