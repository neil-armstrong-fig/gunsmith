import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import {NOISE_SEED} from "@gunsmith/audio-studies/common/noise-seed/NoiseSeed";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";
import type {MeasurementsReport} from "@gunsmith/audio-studies/output/measurements/types/MeasurementsReport";

const KEY_SIGNATURE = "D minor";

/** The engine that rendered the pack. Keep it the version `pnpm-workspace.yaml` pins; a test fails when they differ. */
const ENGINE = "node-web-audio-api@2.2.0";

/** Whether anyone has listened. Measurements only show a render is valid and repeatable, never that it sounds good. */
const LISTENING_REVIEW = "pending; regenerated with native Web Audio; measurements do not prove perceived quality";

/** Writes `measurements.json` beside the WAVs: the format, what rendered it, and every file's measurements, in the order given. */
export async function writeMeasurements(output: string, files: Readonly<Record<string, Measurement>>): Promise<void> {
  const report: MeasurementsReport = {
    ...AUDIO_FORMAT,
    key: KEY_SIGNATURE,
    engine: ENGINE,
    seed: NOISE_SEED,
    files,
    listeningReview: LISTENING_REVIEW,
  };

  await writeFile(join(output, "measurements.json"), JSON.stringify(report, undefined, 2) + "\n");
}
