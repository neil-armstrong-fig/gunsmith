import {startRing} from "@gunsmith/engine/ring/StartRing";

it("starts a round's ring with none of the round played", () => {
  expect(startRing()).toEqual({roundSeconds: 0});
});
