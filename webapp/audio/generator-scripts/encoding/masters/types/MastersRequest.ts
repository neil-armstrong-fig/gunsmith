import type {MeasurementsReport} from "@gunsmith/audio-studies/output/measurements/types/MeasurementsReport";

/** Every master to encode: where they are, where to stage the exports, the encoder to run and what was measured of them. */
export interface MastersRequest {
  binary: string;
  source: string;
  staging: string;
  measurements: MeasurementsReport;
}
