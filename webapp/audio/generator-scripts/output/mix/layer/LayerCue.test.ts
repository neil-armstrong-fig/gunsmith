import assert from "node:assert/strict";
import {it} from "node:test";
import {layerCue} from "@gunsmith/audio-studies/output/mix/layer/LayerCue";

const RATE = 48000;

it("adds the cue into every channel, starting at the frame its time falls on", () => {
  const channels = [new Float32Array(RATE), new Float32Array(RATE)];

  layerCue(channels, Float32Array.of(0.1, 0.2, 0.3), 0.5);

  for (const channel of channels) {
    assert.deepEqual([...channel.subarray(24000, 24003)], [Math.fround(0.1), Math.fround(0.2), Math.fround(0.3)]);
    assert.equal(channel[23999], 0);
    assert.equal(channel[24003], 0);
  }
});

it("rounds its start to the nearest frame", () => {
  const channels = [new Float32Array(100)];

  layerCue(channels, Float32Array.of(1), 10 / RATE + 0.4 / RATE);
  layerCue(channels, Float32Array.of(1), 20 / RATE + 0.6 / RATE);

  assert.equal(channels[0]?.[10], 1);
  assert.equal(channels[0]?.[21], 1);
});

it("adds to what is already there, not over it", () => {
  const channels = [Float32Array.of(0.5, 0.5, 0.5)];

  layerCue(channels, Float32Array.of(0.25, 0.25), 1 / RATE);

  assert.deepEqual([...(channels[0] ?? [])], [0.5, 0.75, 0.75]);
});

it("stops at the end of the channel instead of failing, dropping what would run past it", () => {
  const channels = [new Float32Array(4)];

  layerCue(channels, Float32Array.of(1, 1, 1, 1), 2 / RATE);

  assert.deepEqual([...(channels[0] ?? [])], [0, 0, 1, 1]);
});

it("does nothing for a cue that starts after the end", () => {
  const channels = [new Float32Array(4)];

  layerCue(channels, Float32Array.of(1), 1);

  assert.deepEqual([...(channels[0] ?? [])], [0, 0, 0, 0]);
});
