import type {PcmMeasurement} from "@gunsmith/audio-studies/encoding/pcm/types/PcmMeasurement";

/** What the native decoder found in the exports. */
export interface VerificationReport {
  /** The decoder's build, as `-version` names it. */
  decoder: string;
  /** Every export's measurements, by file name. */
  files: Record<string, PcmMeasurement>;
  passed: boolean;
  failures: string[];
}
