import {expect, it} from "vitest";
import {encodePcm} from "@gunsmith/audio-studies/output/wav/pcm/EncodePcm";

it("writes 16-bit little-endian samples, scaled by 32767 and rounded as JavaScript rounds halves (towards positive)", () => {
  const {data} = encodePcm([Float32Array.of(0.5, -0.5, 0)], "test");

  expect(data.length).toBe(6);
  expect(data.readInt16LE(0)).toBe(16384);
  expect(data.readInt16LE(2)).toBe(-16383);
  expect(data.readInt16LE(4)).toBe(0);
});

it("interleaves channels, frame by frame", () => {
  const pcmOf = (value: number): number => Math.round(Math.fround(value) * 32767);
  const {data} = encodePcm([Float32Array.of(0.1, 0.2), Float32Array.of(-0.1, -0.2)], "test");

  expect(data.length).toBe(8);
  expect([0, 2, 4, 6].map(offset => data.readInt16LE(offset))).toStrictEqual([
    pcmOf(0.1),
    pcmOf(-0.1),
    pcmOf(0.2),
    pcmOf(-0.2),
  ]);
});

it("measures the peak against full scale, which is 32768", () => {
  const {peak} = encodePcm([Float32Array.of(0.25, 0.5)], "test");

  expect(peak).toBe(16384 / 32768);
});

it("measures the power as the sum of squared samples against full scale, over every channel", () => {
  const {power} = encodePcm([Float32Array.of(0.5, 0.5), Float32Array.of(0.25, 0)], "test");

  expect(Math.abs(power - (0.25 + 0.25 + 0.0625))).toBeLessThan(1e-4);
});

it("refuses a sample louder than the mastering ceiling, naming the cue", () => {
  expect(() => encodePcm([Float32Array.of(0.1, 0.709)], "sfx-loud")).toThrow(/sfx-loud: headroom/);
  expect(() => encodePcm([Float32Array.of(-0.8)], "sfx-loud")).toThrow(/sfx-loud: headroom/);
});

it("accepts a sample just under the ceiling", () => {
  expect(() => encodePcm([Float32Array.of(0.7079999)], "ok")).not.toThrow();
});

it("refuses a sample that is not a number", () => {
  expect(() => encodePcm([Float32Array.of(0.1, Number.NaN)], "sfx-nan")).toThrow(/sfx-nan: headroom/);
  expect(() => encodePcm([Float32Array.of(Number.POSITIVE_INFINITY)], "sfx-inf")).toThrow(/sfx-inf: headroom/);
});

it("is empty for no frames", () => {
  const encoded = encodePcm([new Float32Array(0)], "test");

  expect(encoded.data.length).toBe(0);
  expect(encoded.peak).toBe(0);
});

it("measures the peak of a negative sample too, not only a positive one", () => {
  expect(encodePcm([Float32Array.of(-0.5, 0.25)], "test").peak).toBe(16383 / 32768);
});
