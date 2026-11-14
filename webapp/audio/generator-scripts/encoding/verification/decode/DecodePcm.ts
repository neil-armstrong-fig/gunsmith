import {runEncoder} from "@gunsmith/audio-studies/encoding/process/RunEncoder";

/** Decodes a file to interleaved little-endian 32-bit floats, at the file's own rate and channel count. */
export async function decodePcm(binary: string, input: string): Promise<Buffer> {
  return runEncoder(binary, ["-v", "error", "-i", input, "-f", "f32le", "-c:a", "pcm_f32le", "-"]);
}
