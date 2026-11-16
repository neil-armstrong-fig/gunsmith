import {createHash} from "node:crypto";
import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterAll, beforeAll, expect, it} from "vitest";
import {writeWav} from "@gunsmith/audio-studies/output/wav/WriteWav";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-wav-"));
});

afterAll(async () => {
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

  expect(wav.length).toBe(44 + 480 * 2);
  expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
  expect(wav.readUInt32LE(24)).toBe(48000);
  expect(wav.readUInt16LE(22)).toBe(1);
});

it("writes a stereo file when given two channels", async () => {
  await writeWav(folder, {key: "stereo", channels: [sine(100, 0.4, 2), sine(100, 0.2, 3)]});
  const wav = await readFile(join(folder, "stereo.wav"));

  expect(wav.length).toBe(44 + 100 * 4);
  expect(wav.readUInt16LE(22)).toBe(2);
});

it("measures the seconds, channels, peak, rms and a hash of the file it wrote", async () => {
  const cue: RenderedCue = {key: "measured", channels: [sine(4800, 0.5, 10)]};

  const measurement = await writeWav(folder, cue);
  const wav = await readFile(join(folder, "measured.wav"));

  expect(measurement.seconds).toBe(0.1);
  expect(measurement.channels).toBe(1);
  expect(measurement.peakDbfs).toBe(-6.02);
  expect(Math.abs(measurement.rmsDbfs - -9.03), `${measurement.rmsDbfs}`).toBeLessThan(0.02);
  expect(measurement.sha256).toBe(createHash("sha256").update(wav).digest("hex"));
});

it("has no loop measurements for a cue that does not loop", async () => {
  const measurement = await writeWav(folder, {key: "oneshot", channels: [sine(480, 0.3, 4)]});

  expect("seamJumpDbfs" in measurement).toBe(false);
  expect("threeRepeatsSeconds" in measurement).toBe(false);
});

it("measures the join of a loop, and how long three repeats last", async () => {
  const measurement = await writeWav(folder, {key: "looped", channels: [sine(4800, 0.4, 2)], loop: true});

  expect(measurement.seamJumpDbfs ?? 0).toBeLessThan(-40);
  expect(measurement.threeRepeatsSeconds).toBe(0.1 * 3);
});

it("refuses a loop whose last sample is far from its first", async () => {
  const ramp = Float32Array.from({length: 4800}, (_, index) => (index / 4800) * 0.5);

  await expect(writeWav(folder, {key: "clicky", channels: [ramp], loop: true})).rejects.toThrow(
    /clicky: loop discontinuity/,
  );
});

it("does not write a file for a loop it refuses", async () => {
  const ramp = Float32Array.from({length: 4800}, (_, index) => (index / 4800) * 0.5);
  await expect(writeWav(folder, {key: "never-written", channels: [ramp], loop: true})).rejects.toThrow();

  await expect(readFile(join(folder, "never-written.wav"))).rejects.toThrow(/ENOENT/);
});

it("refuses silence", async () => {
  await expect(writeWav(folder, {key: "quiet", channels: [new Float32Array(100)]})).rejects.toThrow(/quiet: silent/);
});

it("refuses a cue louder than the mastering ceiling", async () => {
  await expect(writeWav(folder, {key: "loud", channels: [sine(100, 0.9, 2)]})).rejects.toThrow(/loud: headroom/);
});

it("refuses channels of different lengths, whichever is longer", async () => {
  await expect(writeWav(folder, {key: "ragged", channels: [sine(100, 0.3, 2), sine(90, 0.3, 2)]})).rejects.toThrow(
    /ragged: channels differ/,
  );
  await expect(writeWav(folder, {key: "ragged", channels: [sine(90, 0.3, 2), sine(100, 0.3, 2)]})).rejects.toThrow(
    /ragged: channels differ/,
  );
});

it("refuses a cue with no channels", async () => {
  await expect(writeWav(folder, {key: "empty", channels: []})).rejects.toThrow(/empty: no channels/);
});

it("measures stereo by the same rule as mono: two identical channels read the same rms as one", async () => {
  const one = await writeWav(folder, {key: "mono-rms", channels: [sine(4800, 0.5, 10)]});
  const two = await writeWav(folder, {key: "stereo-rms", channels: [sine(4800, 0.5, 10), sine(4800, 0.5, 10)]});

  expect(two.rmsDbfs).toBe(one.rmsDbfs);
  expect(two.peakDbfs).toBe(one.peakDbfs);
});

it("writes the same bytes every time", async () => {
  const cue: RenderedCue = {key: "same", channels: [sine(960, 0.35, 6)]};
  const first = await writeWav(folder, cue);
  const second = await writeWav(folder, cue);

  expect(first).toStrictEqual(second);
});
