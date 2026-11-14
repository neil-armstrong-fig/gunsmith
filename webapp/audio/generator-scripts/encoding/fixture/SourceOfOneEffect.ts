import assert from "node:assert/strict";
import {copyFile, mkdir, readFile, writeFile} from "node:fs/promises";
import {join, resolve} from "node:path";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import {AUDITION_KEY} from "@gunsmith/audio-studies/output/mix/AuditionKey";
import type {SourceFixture} from "@gunsmith/audio-studies/encoding/fixture/types/SourceFixture";

const MASTERS = resolve(import.meta.dirname, "../../../generated-audio");

/**
 * A small source for the encoder's tests, built from the approved pack: one effect (the UI click by default), and the
 * audition mix, which must be left out. The masters themselves are only read.
 */
export async function sourceOfOneEffect(folder: string, key = "sfx-ui-click"): Promise<SourceFixture> {
  const source = join(folder, "source");
  await mkdir(source);
  const master = await readFile(join(MASTERS, `${key}.wav`));
  await writeFile(join(source, `${key}.wav`), master);
  await copyFile(join(MASTERS, `${AUDITION_KEY}.wav`), join(source, `${AUDITION_KEY}.wav`));
  const measurements = await readMeasurements(MASTERS);
  const measurement = measurements.files[key];
  const audition = measurements.files[AUDITION_KEY];
  assert.ok(measurement && audition, "the approved pack measures the effect and the audition mix");
  const files = {[key]: measurement, [AUDITION_KEY]: audition};
  await writeFile(join(source, "measurements.json"), JSON.stringify({...measurements, files}));

  return {source, master};
}
