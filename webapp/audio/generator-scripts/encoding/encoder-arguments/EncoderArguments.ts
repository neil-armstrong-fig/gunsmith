import {codecArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/codec/CodecArguments";
import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";
import type {EncoderRequest} from "@gunsmith/audio-studies/encoding/encoder-arguments/types/EncoderRequest";

/**
 * The arguments that turn one master into one export: read the first audio stream, drop the metadata, keep the masters' rate
 * and nothing else (no gain, fade, trim or tempo change), then the codec's flags and the file to write. The report records
 * these with the file names in place of the paths, which is this same list asked for with those names.
 */
export function encoderArguments(request: EncoderRequest): string[] {
  return [
    "-v",
    "error",
    "-nostdin",
    "-y",
    "-i",
    request.input,
    "-map",
    "0:a:0",
    "-map_metadata",
    "-1",
    "-ar",
    String(ENCODER_SETTINGS.sampleRate),
    ...codecArguments(request.format),
    request.destination,
  ];
}
