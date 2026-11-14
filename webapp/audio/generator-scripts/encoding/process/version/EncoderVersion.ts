import {runEncoder} from "@gunsmith/audio-studies/encoding/process/RunEncoder";

/** The first line `-version` prints, which names the build. It is written into every report so a result can be traced. */
export async function encoderVersion(binary: string): Promise<string> {
  const printed = await runEncoder(binary, ["-version"]);

  return printed.toString().split("\n")[0] ?? "unknown";
}
