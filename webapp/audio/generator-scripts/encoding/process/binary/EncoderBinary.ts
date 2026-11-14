import {existsSync} from "node:fs";
import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";

/** The encoder to run: the `FFMPEG` override, else Homebrew's full build if it is installed, else the system `ffmpeg`. */
export function encoderBinary(): string {
  const override = process.env["FFMPEG"];
  if (override) {
    return override;
  }
  if (existsSync(ENCODER_SETTINGS.homebrewBinary)) {
    return ENCODER_SETTINGS.homebrewBinary;
  }

  return "ffmpeg";
}
