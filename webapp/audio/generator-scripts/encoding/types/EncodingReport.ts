import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";

/** The inventory of one encode: the build that made it, the rate and every export. */
export interface EncodingReport {
  encoder: string;
  sampleRate: number;
  files: EncodedFile[];
}
