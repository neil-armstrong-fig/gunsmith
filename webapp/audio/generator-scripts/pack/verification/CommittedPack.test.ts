import {createHash} from "node:crypto";
import {readdir, readFile} from "node:fs/promises";
import {join} from "node:path";
import {expect, it} from "vitest";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";

const PACK = join(import.meta.dirname, "..", "..", "..", "generated-audio");

it("has a WAV for every file measurements.json lists, and no other", async () => {
  const wavs = (await readdir(PACK)).filter(file => file.endsWith(".wav")).sort();

  expect(wavs).toStrictEqual(
    Object.keys(await recorded())
      .map(key => `${key}.wav`)
      .sort(),
  );
  expect(wavs.length).toBe(20);
});

it("has every WAV exactly as it was measured: the hash of the bytes on disk is the one recorded", async () => {
  for (const [key, measurement] of Object.entries(await recorded())) {
    const wav = await readFile(join(PACK, `${key}.wav`));

    expect(createHash("sha256").update(wav).digest("hex"), `${key}: edited since it was rendered`).toBe(
      measurement.sha256,
    );
  }
});

it("has every WAV the size its measurements say: 16-bit, 48 kHz, the seconds and channels recorded", async () => {
  for (const [key, measurement] of Object.entries(await recorded())) {
    const wav = await readFile(join(PACK, `${key}.wav`));

    expect(wav.length, key).toBe(44 + Math.round(measurement.seconds * 48000) * measurement.channels * 2);
    expect(wav.readUInt16LE(22), key).toBe(measurement.channels);
  }
});

async function recorded(): Promise<Readonly<Record<string, Measurement>>> {
  return (await readMeasurements(PACK)).files;
}
