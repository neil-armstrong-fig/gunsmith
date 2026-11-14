import {basename, join, dirname} from "node:path";

/** The `ffprobe` that ships beside an `ffmpeg`, so one build encodes and checks. A bare `ffmpeg` means the one on the path. */
export function probeBinary(encoder: string): string {
  if (basename(encoder) === encoder) {
    return "ffprobe";
  }

  return join(dirname(encoder), "ffprobe");
}
