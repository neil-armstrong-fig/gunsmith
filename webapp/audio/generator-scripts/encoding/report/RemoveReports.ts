import {rm} from "node:fs/promises";
import {join} from "node:path";
import {REPORT_FILES} from "@gunsmith/audio-studies/encoding/report/ReportFiles";

/** Removes every report from a folder of exports, so a failed encode never leaves an old report vouching for new files. */
export async function removeReports(folder: string): Promise<void> {
  for (const name of Object.values(REPORT_FILES)) {
    await rm(join(folder, name), {force: true});
  }
}
