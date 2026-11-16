import {expect, it} from "vitest";
import {hatPan} from "@gunsmith/audio-studies/generators/music/bar/pan/HatPan";

it("puts even steps to the left and odd steps to the right, so the hats ping-pong", () => {
  expect(hatPan(0)).toBe(-0.32);
  expect(hatPan(1)).toBe(0.32);
  expect(hatPan(2)).toBe(-0.32);
  expect(hatPan(7)).toBe(0.32);
});
