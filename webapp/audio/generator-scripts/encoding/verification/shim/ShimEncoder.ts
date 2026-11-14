import {chmod, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {probeBinary} from "@gunsmith/audio-studies/encoding/process/binary/ProbeBinary";

/**
 * An `ffmpeg` and an `ffprobe` in `folder` that note each call in `calls.log` (the program and its first argument) and then run
 * the real ones. A test gives the shim to the code under test and reads the log to see which program it really ran. Returns
 * the shim `ffmpeg`, whose `ffprobe` sits beside it.
 */
export async function shimEncoder(folder: string): Promise<string> {
  const log = join(folder, "calls.log");
  const real = encoderBinary();
  for (const [name, target] of [
    ["ffmpeg", real],
    ["ffprobe", probeBinary(real)],
  ] as const) {
    const path = join(folder, name);
    await writeFile(path, `#!/bin/sh\necho "${name} $1" >> "${log}"\nexec "${target}" "$@"\n`);
    await chmod(path, 0o755);
  }

  return join(folder, "ffmpeg");
}
