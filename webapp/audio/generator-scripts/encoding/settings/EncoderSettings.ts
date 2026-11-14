import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";

/** What the encoder is told, and what it may print back. The qualities were chosen in the README's compressed candidate delivery. */
export const ENCODER_SETTINGS = {
  /** Exports keep the masters' rate, so nothing is resampled. */
  sampleRate: AUDIO_FORMAT.sampleRate,
  /** Ogg Vorbis quality, as the encoder's `-q:a` takes it. */
  vorbisQuality: "5",
  /** LAME MP3 variable bit rate quality, as the encoder's `-q:a` takes it. */
  mp3Quality: "2",
  /** The most an encoder may print to a pipe, which is a whole decoded music loop. */
  maxOutputBytes: 128 * 1024 * 1024,
  /** Homebrew's full build, which the standard formula's `ffmpeg` is not: it lacks `libvorbis`. */
  homebrewBinary: "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg",
} as const;
