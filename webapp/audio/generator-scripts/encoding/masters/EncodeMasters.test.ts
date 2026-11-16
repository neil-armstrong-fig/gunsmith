import {mkdir, mkdtemp, readdir, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, assert, beforeEach, expect, it} from "vitest";
import {sourceOfOneEffect} from "@gunsmith/audio-studies/encoding/fixture/SourceOfOneEffect";
import {encodeMasters} from "@gunsmith/audio-studies/encoding/masters/EncodeMasters";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import type {MeasurementsReport} from "@gunsmith/audio-studies/output/measurements/types/MeasurementsReport";

let folder = "";
let source = "";
let staging = "";
let measurements: MeasurementsReport;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-masters-"));
  ({source} = await sourceOfOneEffect(folder));
  staging = join(folder, "staging");
  await mkdir(staging);
  measurements = await readMeasurements(source);
});

afterEach(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("encodes every measured master but the audition mix, in the order they were measured", async () => {
  const files = await encodeMasters({binary: encoderBinary(), source, staging, measurements});

  expect(files.map(file => `${file.key}.${file.format}`)).toStrictEqual(["sfx-ui-click.ogg", "sfx-ui-click.mp3"]);
});

it("refuses a key that could not be an export's file name, before it encodes anything", async () => {
  const click = measurements.files["sfx-ui-click"];
  assert(click);
  const unsafe = {...measurements, files: {"sfx-ui-click": click, "../escape": click}};

  await expect(encodeMasters({binary: encoderBinary(), source, staging, measurements: unsafe})).rejects.toThrow(
    /Invalid master key: \.\.\/escape/,
  );
});

it("leaves staging empty when it refuses", async () => {
  const click = measurements.files["sfx-ui-click"];
  assert(click);
  const unsafe = {...measurements, files: {"not-an-export": click}};

  await expect(encodeMasters({binary: encoderBinary(), source, staging, measurements: unsafe})).rejects.toThrow();
  expect(await readdir(staging)).toStrictEqual([]);
});
