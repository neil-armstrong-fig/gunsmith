import type {EncodingReport} from "@gunsmith/audio-studies/encoding/types/EncodingReport";

/** Exports waiting in `staging`, the folder to publish them to, and the report that names them. */
export interface PublishRequest {
  staging: string;
  output: string;
  report: EncodingReport;
}
