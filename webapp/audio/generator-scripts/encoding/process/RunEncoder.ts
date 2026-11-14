import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";

const execute = promisify(execFile);

/** Runs a program without a shell, so a file name never becomes command text, and returns what it printed. */
export async function runEncoder(binary: string, commandArguments: string[]): Promise<Buffer> {
  const {stdout} = await execute(binary, commandArguments, {
    encoding: "buffer",
    maxBuffer: ENCODER_SETTINGS.maxOutputBytes,
  });

  return stdout;
}
