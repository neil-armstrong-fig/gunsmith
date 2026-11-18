import {expect, it} from "vitest";
import {measurePcm} from "@gunsmith/audio-studies/encoding/pcm/MeasurePcm";

it("rejects silent audio", () => {
  expect(() => measurePcm(floats([0, 0]), 1)).toThrow(/Silent or clipped PCM/);
});

it("rejects audio that reaches full scale, whichever its sign", () => {
  expect(() => measurePcm(floats([1, 0]), 1)).toThrow(/Silent or clipped PCM/);
  expect(() => measurePcm(floats([0, -1]), 1)).toThrow(/Silent or clipped PCM/);
});

it("rejects a sample that is not a number, and a length that is not whole frames", () => {
  expect(() => measurePcm(floats([NaN, 0]), 1)).toThrow(/Invalid PCM sample/);
  expect(() => measurePcm(Buffer.alloc(3), 1)).toThrow(/Invalid PCM length/);
});

it("counts the frames, not the samples", () => {
  expect(measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2).frames).toBe(2);
});

it("finds the loudest sample whichever its sign", () => {
  expect(measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2).peak).toBe(0.5);
});

it("measures the RMS over every sample of every channel", () => {
  const {rmsDbfs} = measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2);

  expect(Math.abs(rmsDbfs + 10.105), String(rmsDbfs)).toBeLessThan(0.01);
});

it("measures the worst join over the channels", () => {
  expect(measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2).loopJump).toBe(0.75);
});

function floats(values: number[]): Buffer {
  const pcm = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => pcm.writeFloatLE(value, index * 4));

  return pcm;
}
