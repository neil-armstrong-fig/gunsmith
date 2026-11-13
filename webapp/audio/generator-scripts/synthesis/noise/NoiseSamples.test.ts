import assert from "node:assert/strict";
import {it} from "node:test";
import {NOISE_SEED} from "@gunsmith/audio-studies/common/noise-seed/NoiseSeed";
import {noiseSamples} from "@gunsmith/audio-studies/synthesis/noise/NoiseSamples";

it("gives the samples it always has for a seed, so the rendered percussion never changes", () => {
  assert.deepEqual(
    [...noiseSamples(4, 8231)],
    [0.03602677956223488, 0.2327185571193695, 0.8818427324295044, -0.9307472705841064],
  );
  assert.deepEqual(
    [...noiseSamples(4, 1)],
    [-0.9998741149902344, -0.9685051441192627, 0.2328082025051117, -0.856762707233429],
  );
});

it("gives exactly the length asked for", () => {
  assert.equal(noiseSamples(0, 5).length, 0);
  assert.equal(noiseSamples(1000, 5).length, 1000);
});

it("stays from -1 up to, but not including, 1", () => {
  for (const sample of noiseSamples(5000, 310)) {
    assert.ok(sample >= -1 && sample < 1);
  }
});

it("is the same every time for one seed, and different for two", () => {
  assert.deepEqual(noiseSamples(64, 310), noiseSamples(64, 310));
  assert.notDeepEqual(noiseSamples(64, 310), noiseSamples(64, 311));
});

it("falls back to the house seed for seed zero, which would otherwise stick at silence", () => {
  assert.deepEqual(noiseSamples(8, 0), noiseSamples(8, NOISE_SEED));
});

it("is not biased high or low", () => {
  const samples = noiseSamples(20000, 99);
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;

  assert.ok(Math.abs(mean) < 0.05, `mean ${mean}`);
});
