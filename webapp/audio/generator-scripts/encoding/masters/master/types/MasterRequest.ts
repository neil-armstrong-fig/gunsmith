import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";

/** One master to encode: where it is, where to stage its exports, the encoder to run and what was measured of the master. */
export interface MasterRequest {
  binary: string;
  source: string;
  staging: string;
  key: string;
  measurement: Measurement;
}
