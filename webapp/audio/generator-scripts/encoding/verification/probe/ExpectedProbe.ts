import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";
import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";

/** The names the probe gives each codec, which are not the formats' own: Ogg holds Vorbis. */
const PROBE_CODEC = {ogg: "vorbis", mp3: "mp3"} as const;

/** What the probe must print for an export: its codec, rate and channel count, comma separated. */
export function expectedProbe(file: EncodedFile): string {
  return `${PROBE_CODEC[file.format]},${ENCODER_SETTINGS.sampleRate},${file.channels}`;
}
