import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {after, before, it} from "node:test";
import {writeWav} from "@gunsmith/audio-studies/output/wav/WriteWav";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

let folder = "";

before(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-wav-"));
});

after(async () => {
  await rm(folder, {recursive: true, force: true});
});

function sine(frames: number, amplitude: number, cycles: number): Float32Array {
  return Float32Array.from(
    {length: frames},
    (_, index) => amplitude * Math.sin((2 * Math.PI * cycles * index) / frames),
  );
}

it("writes <key>.wav, a canonical 16-bit 48 kHz file of the right size", async () => {
  const cue: RenderedCue = {key: "sfx-test", channels: [sine(480, 0.4, 5)]};

  await writeWav(folder, cue);
  const wav = await readFile(join(folder, "sfx-test.wav"));

  assert.equal(wav.length, 44 + 480 * 2);
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.readUInt32LE(24), 48000);
  assert.equal(wav.readUInt16LE(22), 1);
});

it("writes a stereo file when given two channels", async () => {
  await writeWav(folder, {key: "stereo", channels: [sine(100, 0.4, 2), sine(100, 0.2, 3)]});
  const wav = await readFile(join(folder, "stereo.wav"));

  assert.equal(wav.length, 44 + 100 * 4);
  assert.equal(wav.readUInt16LE(22), 2);
});

it("measures the seconds, channels, peak, rms and a hash of the file it wrote", async () => {
  const cue: RenderedCue = {key: "measured", channels: [sine(4800, 0.5, 10)]};

  const measurement = await writeWav(folder, cue);
  const wav = await readFile(join(folder, "measured.wav"));

  assert.equal(measurement.seconds, 0.1);
  assert.equal(measurement.channels, 1);
  assert.equal(measurement.peakDbfs, -6.02);
  assert.ok(Math.abs(measurement.rmsDbfs - -9.03) < 0.02, `${measurement.rmsDbfs}`);
  assert.equal(measurement.sha256, createHash("sha256").update(wav).digest("hex"));
});

it("has no loop measurements for a cue that does not loop", async () => {
  const measurement = await writeWav(folder, {key: "oneshot", channels: [sine(480, 0.3, 4)]});

  assert.equal("seamJumpDbfs" in measurement, false);
  assert.equal("threeRepeatsSeconds" in measurement, false);
});

it("measures the join of a loop, and how long three repeats last", async () => {
  const measurement = await writeWav(folder, {key: "looped", channels: [sine(4800, 0.4, 2)], loop: true});

  assert.ok((measurement.seamJumpDbfs ?? 0) < -40);
  assert.equal(measurement.threeRepeatsSeconds, 0.1 * 3);
});

it("refuses a loop whose last sample is far from its first", async () => {
  const ramp = Float32Array.from({length: 4800}, (_, index) => (index / 4800) * 0.5);

  await assert.rejects(writeWav(folder, {key: "clicky", channels: [ramp], loop: true}), /clicky: loop discontinuity/);
});

it("does not write a file for a loop it refuses", async () => {
  const ramp = Float32Array.from({length: 4800}, (_, index) => (index / 4800) * 0.5);
  await assert.rejects(writeWav(folder, {key: "never-written", channels: [ramp], loop: true}));

  await assert.rejects(readFile(join(folder, "never-written.wav")), /ENOENT/);
});

it("refuses silence", async () => {
  await assert.rejects(writeWav(folder, {key: "quiet", channels: [new Float32Array(100)]}), /quiet: silent/);
});

it("refuses a cue louder than the mastering ceiling", async () => {
  await assert.rejects(writeWav(folder, {key: "loud", channels: [sine(100, 0.9, 2)]}), /loud: headroom/);
});

it("refuses channels of different lengths, whichever is longer", async () => {
  await assert.rejects(
    writeWav(folder, {key: "ragged", channels: [sine(100, 0.3, 2), sine(90, 0.3, 2)]}),
    /ragged: channels differ/,
  );
  await assert.rejects(
    writeWav(folder, {key: "ragged", channels: [sine(90, 0.3, 2), sine(100, 0.3, 2)]}),
    /ragged: channels differ/,
  );
});

it("refuses a cue with no channels", async () => {
  await assert.rejects(writeWav(folder, {key: "empty", channels: []}), /empty: no channels/);
});

it("measures stereo by the same rule as mono: two identical channels read the same rms as one", async () => {
  const one = await writeWav(folder, {key: "mono-rms", channels: [sine(4800, 0.5, 10)]});
  const two = await writeWav(folder, {key: "stereo-rms", channels: [sine(4800, 0.5, 10), sine(4800, 0.5, 10)]});

  assert.equal(two.rmsDbfs, one.rmsDbfs);
  assert.equal(two.peakDbfs, one.peakDbfs);
});

it("writes the same bytes every time", async () => {
  const cue: RenderedCue = {key: "same", channels: [sine(960, 0.35, 6)]};
  const first = await writeWav(folder, cue);
  const second = await writeWav(folder, cue);

  assert.deepEqual(first, second);
});
