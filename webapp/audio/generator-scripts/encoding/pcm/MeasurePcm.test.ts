import assert from "node:assert/strict";
import {it} from "node:test";
import {measurePcm} from "@gunsmith/audio-studies/encoding/pcm/MeasurePcm";

function floats(values: number[]): Buffer {
  const pcm = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => pcm.writeFloatLE(value, index * 4));

  return pcm;
}

it("rejects silent audio", () => {
  assert.throws(() => measurePcm(floats([0, 0]), 1), /Silent or clipped PCM/);
});

it("rejects audio that reaches full scale, whichever its sign", () => {
  assert.throws(() => measurePcm(floats([1, 0]), 1), /Silent or clipped PCM/);
  assert.throws(() => measurePcm(floats([0, -1]), 1), /Silent or clipped PCM/);
});

it("rejects a sample that is not a number, and a length that is not whole frames", () => {
  assert.throws(() => measurePcm(floats([NaN, 0]), 1), /Invalid PCM sample/);
  assert.throws(() => measurePcm(Buffer.alloc(3), 1), /Invalid PCM length/);
});

it("counts the frames, not the samples", () => {
  assert.equal(measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2).frames, 2);
});

it("finds the loudest sample whichever its sign", () => {
  assert.equal(measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2).peak, 0.5);
});

it("measures the RMS over every sample of every channel", () => {
  const {rmsDbfs} = measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2);

  assert.ok(Math.abs(rmsDbfs + 10.105) < 0.01, String(rmsDbfs));
});

it("measures the worst join over the channels", () => {
  assert.equal(measurePcm(floats([0.25, -0.5, 0.125, 0.25]), 2).loopJump, 0.75);
});
