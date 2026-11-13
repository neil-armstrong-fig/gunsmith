import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";

/** What `measurements.json` holds: the format the pack was rendered in, what rendered it, and every file's measurements. */
export interface MeasurementsReport {
  sampleRate: number;
  sampleBits: number;
  bpm: number;
  key: string;
  /** The renderer and its version, as `node-web-audio-api@2.2.0`. */
  engine: string;
  /** The house noise seed (`NOISE_SEED`). */
  seed: number;
  /** In the order the files were rendered. */
  files: Readonly<Record<string, Measurement>>;
  /** Whether anyone has listened to the pack. */
  listeningReview: string;
}
