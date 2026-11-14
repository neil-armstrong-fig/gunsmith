import assert from "node:assert/strict";
import {it} from "node:test";
import {sumOfSquares} from "@gunsmith/audio-studies/encoding/pcm/power/SumOfSquares";

it("adds up the squares of every sample in every channel", () => {
  assert.equal(sumOfSquares([Float32Array.of(3, -1), Float32Array.of(4, 0.5)]), 26.25);
});

it("is zero for silence and for no channels at all", () => {
  assert.equal(sumOfSquares([Float32Array.of(0, 0)]), 0);
  assert.equal(sumOfSquares([]), 0);
});
