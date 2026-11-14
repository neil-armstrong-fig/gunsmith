import type {ExportFormat} from "@gunsmith/audio-studies/encoding/format/ExportFormat";

/** One export, as the report records it. */
export interface EncodedFile {
  /** The master's key, as `sfx-hit`. */
  key: string;
  format: ExportFormat;
  /** The SHA-256 of the WAV master this was encoded from. */
  sourceSha256: string;
  /** The SHA-256 of this export. Ogg's changes on every encode, because its container carries a random stream serial number. */
  sha256: string;
  bytes: number;
  channels: number;
  /** The master's length, which the export must decode to. */
  seconds: number;
  /** The encoder's arguments, with the file names in place of the paths. */
  arguments: string[];
}
