import {copyFile} from "node:fs/promises";
import {join} from "node:path";
import {exportName} from "@gunsmith/audio-studies/encoding/files/ExportName";
import {REPORT_FILES} from "@gunsmith/audio-studies/encoding/report/ReportFiles";
import {writeReport} from "@gunsmith/audio-studies/encoding/report/WriteReport";
import type {PublishRequest} from "@gunsmith/audio-studies/encoding/publish/types/PublishRequest";

/**
 * Moves finished exports out of staging and then, last, writes the report that names them. The report is the last thing to
 * appear, so a folder that has one holds every export it lists, and an encode that fails part-way publishes nothing it vouches for.
 */
export async function publishEncoded(request: PublishRequest): Promise<void> {
  const {staging, output, report} = request;
  for (const file of report.files) {
    const name = exportName(file.key, file.format);
    await copyFile(join(staging, name), join(output, name));
  }
  await writeReport(join(output, REPORT_FILES.encoding), report);
}
