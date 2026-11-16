import {chmod, mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, beforeEach, expect, it} from "vitest";
import {sourceOfOneEffect} from "@gunsmith/audio-studies/encoding/fixture/SourceOfOneEffect";
import {sha256Of} from "@gunsmith/audio-studies/encoding/hash/Sha256Of";
import {encodeMaster} from "@gunsmith/audio-studies/encoding/masters/master/EncodeMaster";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";

let folder = "";
let source = "";
let staging = "";
let measurement: Measurement;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-master-"));
  ({source} = await sourceOfOneEffect(folder));
  staging = join(folder, "staging");
  await mkdir(staging);
  measurement = (await readMeasurements(source)).files["sfx-ui-click"] as Measurement;
});

afterEach(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("encodes the master in each format into staging and describes each file", async () => {
  const files = await encodeMaster({binary: encoderBinary(), source, staging, key: "sfx-ui-click", measurement});

  expect(files.map(file => file.format)).toStrictEqual(["ogg", "mp3"]);
  for (const file of files) {
    expect(file.sha256).toBe(sha256Of(await readFile(join(staging, `sfx-ui-click.${file.format}`))));
    expect(file.channels).toBe(measurement.channels);
    expect(file.seconds).toBe(measurement.seconds);
  }
});

it("refuses a master whose hash is not the measured one, before it runs the encoder", async () => {
  const wrong = {...measurement, sha256: "0".repeat(64)};

  await expect(
    encodeMaster({binary: "/missing/encoder", source, staging, key: "sfx-ui-click", measurement: wrong}),
  ).rejects.toThrow(/sfx-ui-click: master hash mismatch/);
});

it("refuses an encode during which the master changed", async () => {
  const master = join(source, "sfx-ui-click.wav");
  const meddler = join(folder, "meddler");
  // Stands in for an encoder that writes its output and also alters the file it was reading, which is the file named after `-i`.
  await writeFile(meddler, `#!/bin/sh\nfor last; do :; done\necho encoded > "$last"\necho changed >> "${master}"\n`);
  await chmod(meddler, 0o755);

  await expect(encodeMaster({binary: meddler, source, staging, key: "sfx-ui-click", measurement})).rejects.toThrow(
    /sfx-ui-click: master changed during encoding/,
  );
});
