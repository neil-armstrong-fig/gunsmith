import assert from "node:assert/strict";
import {it} from "node:test";
import {limitPeak} from "@gunsmith/audio-studies/common/levels/limit/LimitPeak";

it("turns everything down by the same amount when the peak is over the ceiling", () => {
  const channels = [Float32Array.of(1, -0.5), Float32Array.of(0.25, 0)];

  limitPeak(channels, 0.5);

  assert.deepEqual([...(channels[0] ?? [])], [0.5, -0.25]);
  assert.deepEqual([...(channels[1] ?? [])], [0.125, 0]);
});

it("leaves a signal alone that is already under the ceiling", () => {
  const channels = [Float32Array.of(0.4, -0.2)];

  limitPeak(channels, 0.5);

  assert.deepEqual([...(channels[0] ?? [])], [Math.fround(0.4), Math.fround(-0.2)]);
});

it("leaves a signal alone that is exactly at the ceiling", () => {
  const channels = [Float32Array.of(0.5)];

  limitPeak(channels, 0.5);

  assert.equal(channels[0]?.[0], 0.5);
});

it("leaves silence alone", () => {
  const channels = [new Float32Array(3)];

  limitPeak(channels, 0.5);

  assert.deepEqual([...(channels[0] ?? [])], [0, 0, 0]);
});
