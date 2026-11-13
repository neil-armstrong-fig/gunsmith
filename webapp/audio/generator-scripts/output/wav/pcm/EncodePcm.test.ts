import assert from "node:assert/strict";
import {it} from "node:test";
import {encodePcm} from "@gunsmith/audio-studies/output/wav/pcm/EncodePcm";

it("writes 16-bit little-endian samples, scaled by 32767 and rounded as JavaScript rounds halves (towards positive)", () => {
  const {data} = encodePcm([Float32Array.of(0.5, -0.5, 0)], "test");

  assert.equal(data.length, 6);
  assert.equal(data.readInt16LE(0), 16384);
  assert.equal(data.readInt16LE(2), -16383);
  assert.equal(data.readInt16LE(4), 0);
});

it("interleaves channels, frame by frame", () => {
  const pcmOf = (value: number): number => Math.round(Math.fround(value) * 32767);
  const {data} = encodePcm([Float32Array.of(0.1, 0.2), Float32Array.of(-0.1, -0.2)], "test");

  assert.equal(data.length, 8);
  assert.deepEqual(
    [0, 2, 4, 6].map(offset => data.readInt16LE(offset)),
    [pcmOf(0.1), pcmOf(-0.1), pcmOf(0.2), pcmOf(-0.2)],
  );
});

it("measures the peak against full scale, which is 32768", () => {
  const {peak} = encodePcm([Float32Array.of(0.25, 0.5)], "test");

  assert.equal(peak, 16384 / 32768);
});

it("measures the power as the sum of squared samples against full scale, over every channel", () => {
  const {power} = encodePcm([Float32Array.of(0.5, 0.5), Float32Array.of(0.25, 0)], "test");

  assert.ok(Math.abs(power - (0.25 + 0.25 + 0.0625)) < 1e-4);
});

it("refuses a sample louder than the mastering ceiling, naming the cue", () => {
  assert.throws(() => encodePcm([Float32Array.of(0.1, 0.709)], "sfx-loud"), /sfx-loud: headroom/);
  assert.throws(() => encodePcm([Float32Array.of(-0.8)], "sfx-loud"), /sfx-loud: headroom/);
});

it("accepts a sample just under the ceiling", () => {
  assert.doesNotThrow(() => encodePcm([Float32Array.of(0.7079999)], "ok"));
});

it("refuses a sample that is not a number", () => {
  assert.throws(() => encodePcm([Float32Array.of(0.1, Number.NaN)], "sfx-nan"), /sfx-nan: headroom/);
  assert.throws(() => encodePcm([Float32Array.of(Number.POSITIVE_INFINITY)], "sfx-inf"), /sfx-inf: headroom/);
});

it("is empty for no frames", () => {
  const encoded = encodePcm([new Float32Array(0)], "test");

  assert.equal(encoded.data.length, 0);
  assert.equal(encoded.peak, 0);
});

it("measures the peak of a negative sample too, not only a positive one", () => {
  assert.equal(encodePcm([Float32Array.of(-0.5, 0.25)], "test").peak, 16383 / 32768);
});
