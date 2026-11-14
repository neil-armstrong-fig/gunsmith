import {runEncoder} from "@gunsmith/audio-studies/encoding/process/RunEncoder";

/** What the probe prints for the first audio stream of a file: its codec, rate and channel count. */
export async function probeExport(probe: string, input: string): Promise<string> {
  const printed = await runEncoder(probe, [
    "-v",
    "error",
    "-select_streams",
    "a:0",
    "-show_entries",
    "stream=codec_name,sample_rate,channels",
    "-of",
    "csv=p=0",
    input,
  ]);

  return printed.toString().trim();
}
