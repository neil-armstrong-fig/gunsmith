import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {REPORT_FILES} from "@gunsmith/audio-studies/encoding/report/ReportFiles";
import type {EncodingReport} from "@gunsmith/audio-studies/encoding/types/EncodingReport";

/** Reads the report the exporter wrote into `folder`. The file is our own output, so it is trusted as written. */
export async function readEncodingReport(folder: string): Promise<EncodingReport> {
  return JSON.parse(await readFile(join(folder, REPORT_FILES.encoding), "utf8")) as EncodingReport;
}
