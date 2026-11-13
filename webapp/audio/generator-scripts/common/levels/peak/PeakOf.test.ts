import assert from "node:assert/strict";
import {it} from "node:test";
import {peakOf} from "@gunsmith/audio-studies/common/levels/peak/PeakOf";

it("finds the loudest sample, whichever its sign", () => {
  assert.equal(peakOf([Float32Array.of(0.1, -0.5, 0.25)]), 0.5);
  assert.equal(peakOf([Float32Array.of(0.1, 0.5, -0.25)]), 0.5);
});

it("looks across every channel", () => {
  assert.equal(peakOf([Float32Array.of(0.1, 0.2), Float32Array.of(-0.75, 0.3)]), 0.75);
});

it("is zero for silence and for no channels", () => {
  assert.equal(peakOf([new Float32Array(4)]), 0);
  assert.equal(peakOf([]), 0);
});
