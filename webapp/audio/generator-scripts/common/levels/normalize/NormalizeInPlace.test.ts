import assert from "node:assert/strict";
import {it} from "node:test";
import {normalizeInPlace} from "@gunsmith/audio-studies/common/levels/normalize/NormalizeInPlace";

it("scales every channel so a sample at the old peak lands on the target", () => {
  const channels = [Float32Array.of(0.5, -0.25), Float32Array.of(0.1, 0.4)];

  normalizeInPlace(channels, {peak: 0.5, target: 0.25});

  assert.deepEqual([...(channels[0] ?? [])], [0.25, -0.125]);
  assert.deepEqual([...(channels[1] ?? [])], [Math.fround(0.05), Math.fround(0.2)]);
});

it("can turn a signal up as well as down", () => {
  const channels = [Float32Array.of(0.1)];

  normalizeInPlace(channels, {peak: 0.1, target: 0.5});

  assert.equal(channels[0]?.[0], 0.5);
});

it("gives the bits of multiplying by the target and then dividing by the peak, as the approved pack was rendered", () => {
  const sample = Math.fround(0.123456789);
  const channels = [Float32Array.of(sample)];

  normalizeInPlace(channels, {peak: 0.3, target: 0.52});

  assert.equal(channels[0]?.[0], Math.fround((sample * 0.52) / 0.3));
});

it("gives, for every sample, exactly the bits of multiplying by the target and then dividing by the peak", () => {
  const samples = Float32Array.from({length: 2000}, (_, index) => Math.sin(index * 12.9898) * 0.43);
  const channels = [samples.slice()];

  normalizeInPlace(channels, {peak: 0.43, target: 0.52});

  for (const [index, sample] of samples.entries()) {
    assert.equal(channels[0]?.[index], Math.fround((sample * 0.52) / 0.43), `sample ${index}`);
  }
});
