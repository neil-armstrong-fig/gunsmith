import {expect, it} from "vitest";
import {sumOfSquares} from "@gunsmith/audio-studies/encoding/pcm/power/SumOfSquares";

it("adds up the squares of every sample in every channel", () => {
  expect(sumOfSquares([Float32Array.of(3, -1), Float32Array.of(4, 0.5)])).toBe(26.25);
});

it("is zero for silence and for no channels at all", () => {
  expect(sumOfSquares([Float32Array.of(0, 0)])).toBe(0);
  expect(sumOfSquares([])).toBe(0);
});
