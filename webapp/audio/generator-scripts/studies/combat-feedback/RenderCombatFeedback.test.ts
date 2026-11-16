import {createHash} from "node:crypto";
import {mkdtemp, readdir, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {expect, it} from "vitest";
import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";
import {renderCombatFeedback} from "@gunsmith/audio-studies/studies/combat-feedback/RenderCombatFeedback";

const COMMITTED = join(import.meta.dirname, "..", "..", "..", "studies", "combat-feedback");

it("writes the selected cue and its measurements into the folder it is given, and nothing else", async () => {
  await inRenderedFolder(async output => {
    expect((await readdir(output)).sort()).toStrictEqual(["damage-crunch.wav", "measurements.json"]);
    expect(Object.keys((await readMeasurements(output)).files)).toStrictEqual(["damage-crunch"]);
  });
});

it("renders the same bytes every time", async () => {
  await inRenderedFolder(async first => {
    await inRenderedFolder(async second => {
      for (const file of ["damage-crunch.wav", "measurements.json"]) {
        expect(await readFile(join(first, file)), file).toStrictEqual(await readFile(join(second, file)));
      }
    });
  });
});

it("makes dry mono 16-bit 48 kHz candidates that are audible and inside the mastering peak", async () => {
  await inRenderedFolder(async output => {
    const report = await readMeasurements(output);

    expect(report.sampleRate).toBe(48000);
    expect(report.sampleBits).toBe(16);
    for (const [key, measurement] of Object.entries(report.files)) {
      expect(measurement.channels, key).toBe(1);
      expect(measurement.peakDbfs, `${key} is too quiet to audition`).toBeGreaterThan(-20);
      expect(measurement.peakDbfs, `${key} is over the mastering peak`).toBeLessThanOrEqual(
        20 * Math.log10(MASTERING.maxPeak),
      );
    }
  });
});

it("records the hash of the WAV it wrote", async () => {
  await inRenderedFolder(async output => {
    for (const [key, measurement] of Object.entries((await readMeasurements(output)).files)) {
      const wav = await readFile(join(output, `${key}.wav`));

      expect(createHash("sha256").update(wav).digest("hex"), key).toBe(measurement.sha256);
    }
  });
});

it("renders the candidates that are committed, byte for byte", async () => {
  const committed = await readMeasurements(COMMITTED);

  await inRenderedFolder(async output => {
    expect((await readMeasurements(output)).files).toStrictEqual(committed.files);
  });
});

async function inRenderedFolder(check: (output: string) => Promise<void>): Promise<void> {
  const output = await mkdtemp(join(tmpdir(), "combat-feedback-"));
  try {
    await renderCombatFeedback(output);
    await check(output);
  } finally {
    await rm(output, {recursive: true, force: true});
  }
}
