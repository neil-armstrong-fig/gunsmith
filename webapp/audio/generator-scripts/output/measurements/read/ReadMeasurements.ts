import {readFile} from "node:fs/promises";
import {join} from "node:path";
import type {MeasurementsReport} from "@gunsmith/audio-studies/output/measurements/types/MeasurementsReport";

/** Reads the `measurements.json` that `writeMeasurements` wrote into `folder`. The file is our own output, so it is trusted as written. */
export async function readMeasurements(folder: string): Promise<MeasurementsReport> {
  return JSON.parse(await readFile(join(folder, "measurements.json"), "utf8")) as MeasurementsReport;
}
