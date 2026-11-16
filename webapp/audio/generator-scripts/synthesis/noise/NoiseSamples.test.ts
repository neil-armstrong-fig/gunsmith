import {expect, it} from "vitest";
import {NOISE_SEED} from "@gunsmith/audio-studies/common/noise-seed/NoiseSeed";
import {noiseSamples} from "@gunsmith/audio-studies/synthesis/noise/NoiseSamples";

it("gives the samples it always has for a seed, so the rendered percussion never changes", () => {
  expect([...noiseSamples(4, 8231)]).toStrictEqual([
    0.03602677956223488, 0.2327185571193695, 0.8818427324295044, -0.9307472705841064,
  ]);
  expect([...noiseSamples(4, 1)]).toStrictEqual([
    -0.9998741149902344, -0.9685051441192627, 0.2328082025051117, -0.856762707233429,
  ]);
});

it("gives exactly the length asked for", () => {
  expect(noiseSamples(0, 5).length).toBe(0);
  expect(noiseSamples(1000, 5).length).toBe(1000);
});

it("stays from -1 up to, but not including, 1", () => {
  for (const sample of noiseSamples(5000, 310)) {
    expect(sample).toBeGreaterThanOrEqual(-1);
    expect(sample).toBeLessThan(1);
  }
});

it("is the same every time for one seed, and different for two", () => {
  expect(noiseSamples(64, 310)).toStrictEqual(noiseSamples(64, 310));
  expect(noiseSamples(64, 310)).not.toStrictEqual(noiseSamples(64, 311));
});

it("falls back to the house seed for seed zero, which would otherwise stick at silence", () => {
  expect(noiseSamples(8, 0)).toStrictEqual(noiseSamples(8, NOISE_SEED));
});

it("is not biased high or low", () => {
  const samples = noiseSamples(20000, 99);
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;

  expect(Math.abs(mean), `mean ${mean}`).toBeLessThan(0.05);
});
