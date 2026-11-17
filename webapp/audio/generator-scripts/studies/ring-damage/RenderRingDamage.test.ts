import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, expect, it} from "vitest";
import {renderRingDamage} from "@gunsmith/audio-studies/studies/ring-damage/RenderRingDamage";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {decodePcm} from "@gunsmith/audio-studies/encoding/verification/decode/DecodePcm";
import {measurePcm} from "@gunsmith/audio-studies/encoding/pcm/MeasurePcm";
import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";

let output: string;

beforeEach(async () => {
  output = await mkdtemp(join(tmpdir(), "ring-damage-"));
});

afterEach(async () => {
  await rm(output, {recursive: true, force: true});
});

it("delivers a two-second mono 48 kHz 16-bit master with a seamless join", async () => {
  await renderRingDamage(output);
  const wav = await readFile(join(output, "sfx-ring-damage-loop.wav"));
  expect(wav.readUInt16LE(22)).toBe(1);
  expect(wav.readUInt32LE(24)).toBe(48000);
  expect(wav.readUInt16LE(34)).toBe(16);
  expect(wav.length - 44).toBe(96000 * 2);
  const pcmMeasurement = measurePcm(await decodePcm(encoderBinary(), join(output, "sfx-ring-damage-loop.wav")), 1);
  expect(pcmMeasurement.loopJump).toBeLessThan(MASTERING.maxLoopJump);
  expect(pcmMeasurement.peak).toBeLessThanOrEqual(0.13);
  expect(pcmMeasurement.rmsDbfs).toBeGreaterThan(-35);
});

it("sustains the bed through both ends without baked-in fades or silent windows", async () => {
  await renderRingDamage(output);
  const pcm = await decodePcm(encoderBinary(), join(output, "sfx-ring-damage-loop.wav"));
  const levels: number[] = [];
  for (let offset = 0; offset < pcm.length; offset += 4800 * 4) {
    levels.push(measurePcm(pcm.subarray(offset, offset + 4800 * 4), 1).rmsDbfs);
  }
  expect(Math.max(...levels) - Math.min(...levels)).toBeLessThan(4);
});

it("exports MP3 with native length and loop join inside the existing limits", async () => {
  await renderRingDamage(output);
  const pcmMeasurement = measurePcm(await decodePcm(encoderBinary(), join(output, "sfx-ring-damage-loop.mp3")), 1);
  expect(Math.abs(pcmMeasurement.frames - 96000)).toBeLessThanOrEqual(1);
  expect(pcmMeasurement.loopJump).toBeLessThan(MASTERING.maxLoopJump);
});

it("reproduces the master and MP3 byte for byte", async () => {
  await renderRingDamage(output);
  const wav = await readFile(join(output, "sfx-ring-damage-loop.wav"));
  const mp3 = await readFile(join(output, "sfx-ring-damage-loop.mp3"));
  await renderRingDamage(output);
  expect(await readFile(join(output, "sfx-ring-damage-loop.wav"))).toEqual(wav);
  expect(await readFile(join(output, "sfx-ring-damage-loop.mp3"))).toEqual(mp3);
});
