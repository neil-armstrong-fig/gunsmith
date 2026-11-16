import {createHash} from "node:crypto";
import {mkdtemp, readFile, readdir, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {expect, it} from "vitest";
import {renderEmptyWeaponClick} from "@gunsmith/audio-studies/studies/empty-weapon-click/RenderEmptyWeaponClick";
import {readMeasurements} from "@gunsmith/audio-studies/output/measurements/read/ReadMeasurements";

const COMMITTED = join(import.meta.dirname, "../../../studies/empty-weapon-click");
const OUTPUT_FILES = ["empty-tight.wav", "measurements.json"];
const QUIET_TAIL_FRAMES = 480; // The final 10 ms at 48 kHz.
const BYTES_PER_SAMPLE = 2; // 16-bit PCM.

it("writes only the selected click and its measurements", async () => {
  await inRenderedFolder(async output => {
    expect((await readdir(output)).sort()).toStrictEqual(OUTPUT_FILES);
    expect(Object.keys((await readMeasurements(output)).files)).toStrictEqual(["empty-tight"]);
  });
});

it("renders identical WAV and measurement bytes every time", async () => {
  await inRenderedFolder(async first => {
    await inRenderedFolder(async second => {
      for (const file of OUTPUT_FILES) {
        expect(await readFile(join(first, file)), file).toStrictEqual(await readFile(join(second, file)));
      }
    });
  });
});

it("renders a short audible mono 16-bit 48 kHz click with headroom", async () => {
  await inRenderedFolder(async output => {
    const report = await readMeasurements(output);
    const measurement = report.files["empty-tight"];
    if (!measurement) throw new Error("Missing empty-tight measurements");

    expect(report.sampleRate).toBe(48000);
    expect(report.sampleBits).toBe(16);
    expect(measurement.channels).toBe(1);
    expect(measurement.seconds).toBeGreaterThanOrEqual(0.05);
    expect(measurement.seconds).toBeLessThanOrEqual(0.13);
    expect(measurement.peakDbfs).toBeGreaterThan(-12);
    expect(measurement.peakDbfs).toBeLessThanOrEqual(-6);
    expect(measurement.rmsDbfs).toBeGreaterThan(-40);
  });
});

it("records the hash of the WAV it actually wrote", async () => {
  await inRenderedFolder(async output => {
    const wav = await readFile(join(output, "empty-tight.wav"));
    const report = await readMeasurements(output);

    expect(createHash("sha256").update(wav).digest("hex")).toBe(report.files["empty-tight"]?.sha256);
  });
});

it("ends quietly throughout the final 10 ms", async () => {
  await inRenderedFolder(async output => {
    const wav = await readFile(join(output, "empty-tight.wav"));
    const tail = wav.subarray(-QUIET_TAIL_FRAMES * BYTES_PER_SAMPLE);

    for (let offset = 0; offset < tail.length; offset += BYTES_PER_SAMPLE) {
      expect(Math.abs(tail.readInt16LE(offset))).toBeLessThan(100);
    }
  });
});

it("matches the selected click so tuning is a deliberate sound change", async () => {
  const committed = await readMeasurements(COMMITTED);

  await inRenderedFolder(async output => {
    expect((await readMeasurements(output)).files).toStrictEqual(committed.files);
  });
});

async function inRenderedFolder(check: (output: string) => Promise<void>): Promise<void> {
  const output = await mkdtemp(join(tmpdir(), "empty-click-"));
  try {
    await renderEmptyWeaponClick(output);
    await check(output);
  } finally {
    await rm(output, {recursive: true, force: true});
  }
}
