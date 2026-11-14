import type {ExportFormat} from "@gunsmith/audio-studies/encoding/format/ExportFormat";

/** One encode: the master to read, the file to write and the format to write it in. */
export interface EncoderRequest {
  input: string;
  destination: string;
  format: ExportFormat;
}
