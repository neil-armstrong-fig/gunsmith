import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";
import type {ExportFormat} from "@gunsmith/audio-studies/encoding/format/ExportFormat";

/** The codec's own flags. MP3 writes the Xing header, which is where a decoder reads the delay it must trim from a loop. */
export function codecArguments(format: ExportFormat): string[] {
  if (format === "ogg") {
    return ["-c:a", "libvorbis", "-q:a", ENCODER_SETTINGS.vorbisQuality];
  }

  return ["-c:a", "libmp3lame", "-q:a", ENCODER_SETTINGS.mp3Quality, "-write_xing", "1"];
}
