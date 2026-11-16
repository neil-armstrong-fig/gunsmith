import {expect, it} from "vitest";
import {layerCue} from "@gunsmith/audio-studies/output/mix/layer/LayerCue";

const RATE = 48000;

it("adds the cue into every channel, starting at the frame its time falls on", () => {
  const channels = [new Float32Array(RATE), new Float32Array(RATE)];

  layerCue(channels, Float32Array.of(0.1, 0.2, 0.3), 0.5);

  for (const channel of channels) {
    expect([...channel.subarray(24000, 24003)]).toStrictEqual([Math.fround(0.1), Math.fround(0.2), Math.fround(0.3)]);
    expect(channel[23999]).toBe(0);
    expect(channel[24003]).toBe(0);
  }
});

it("rounds its start to the nearest frame", () => {
  const channels = [new Float32Array(100)];

  layerCue(channels, Float32Array.of(1), 10 / RATE + 0.4 / RATE);
  layerCue(channels, Float32Array.of(1), 20 / RATE + 0.6 / RATE);

  expect(channels[0]?.[10]).toBe(1);
  expect(channels[0]?.[21]).toBe(1);
});

it("adds to what is already there, not over it", () => {
  const channels = [Float32Array.of(0.5, 0.5, 0.5)];

  layerCue(channels, Float32Array.of(0.25, 0.25), 1 / RATE);

  expect([...(channels[0] ?? [])]).toStrictEqual([0.5, 0.75, 0.75]);
});

it("stops at the end of the channel instead of failing, dropping what would run past it", () => {
  const channels = [new Float32Array(4)];

  layerCue(channels, Float32Array.of(1, 1, 1, 1), 2 / RATE);

  expect([...(channels[0] ?? [])]).toStrictEqual([0, 0, 1, 1]);
});

it("does nothing for a cue that starts after the end", () => {
  const channels = [new Float32Array(4)];

  layerCue(channels, Float32Array.of(1), 1);

  expect([...(channels[0] ?? [])]).toStrictEqual([0, 0, 0, 0]);
});
