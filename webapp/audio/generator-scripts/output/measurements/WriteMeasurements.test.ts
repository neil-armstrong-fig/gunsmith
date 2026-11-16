import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterAll, beforeAll, expect, it} from "vitest";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import {writeMeasurements} from "@gunsmith/audio-studies/output/measurements/WriteMeasurements";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";
import type {PackageManifest} from "@gunsmith/audio-studies/output/measurements/types/PackageManifest";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-measurements-"));
});

afterAll(async () => {
  await rm(folder, {recursive: true, force: true});
});

const measurement: Measurement = {seconds: 0.5, channels: 1, peakDbfs: -6, rmsDbfs: -12, sha256: "abc"};

it("writes measurements.json: the format, the key, the engine, the seed, the files and the review status", async () => {
  await writeMeasurements(folder, {"sfx-a": measurement});
  const report = await readMeasurements(folder);

  expect(report).toStrictEqual({
    sampleRate: 48000,
    sampleBits: 16,
    bpm: 128,
    key: "D minor",
    engine: "node-web-audio-api@2.2.0",
    seed: 8231,
    files: {"sfx-a": measurement},
    listeningReview: "pending; regenerated with native Web Audio; measurements do not prove perceived quality",
  });
});

it("lists the files in the order it was given them", async () => {
  await writeMeasurements(folder, {"sfx-b": measurement, "sfx-a": measurement, music: measurement});

  expect(Object.keys((await readMeasurements(folder)).files)).toStrictEqual(["sfx-b", "sfx-a", "music"]);
});

it("is indented by two spaces and ends with a newline, so Prettier leaves it alone", async () => {
  await writeMeasurements(folder, {"sfx-a": measurement});
  const text = await readFile(join(folder, "measurements.json"), "utf8");

  expect(text.startsWith('{\n  "sampleRate": 48000,')).toBe(true);
  expect(text.endsWith("}\n")).toBe(true);
});

it("names the engine version that is actually installed, so the record cannot drift from the pin", async () => {
  const manifest = join(import.meta.dirname, "..", "..", "..", "node_modules", "node-web-audio-api", "package.json");
  const installed = JSON.parse(await readFile(manifest, "utf8")) as PackageManifest;
  await writeMeasurements(folder, {});

  expect((await readMeasurements(folder)).engine).toBe(`node-web-audio-api@${installed.version}`);
});
