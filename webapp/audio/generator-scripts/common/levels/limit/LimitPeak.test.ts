import {expect, it} from "vitest";
import {limitPeak} from "@gunsmith/audio-studies/common/levels/limit/LimitPeak";

it("turns everything down by the same amount when the peak is over the ceiling", () => {
  const channels = [Float32Array.of(1, -0.5), Float32Array.of(0.25, 0)];

  limitPeak(channels, 0.5);

  expect([...(channels[0] ?? [])]).toStrictEqual([0.5, -0.25]);
  expect([...(channels[1] ?? [])]).toStrictEqual([0.125, 0]);
});

it("leaves a signal alone that is already under the ceiling", () => {
  const channels = [Float32Array.of(0.4, -0.2)];

  limitPeak(channels, 0.5);

  expect([...(channels[0] ?? [])]).toStrictEqual([Math.fround(0.4), Math.fround(-0.2)]);
});

it("leaves a signal alone that is exactly at the ceiling", () => {
  const channels = [Float32Array.of(0.5)];

  limitPeak(channels, 0.5);

  expect(channels[0]?.[0]).toBe(0.5);
});

it("leaves silence alone", () => {
  const channels = [new Float32Array(3)];

  limitPeak(channels, 0.5);

  expect([...(channels[0] ?? [])]).toStrictEqual([0, 0, 0]);
});
