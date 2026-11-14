import type {PageRow} from "@gunsmith/audio-studies/browser/run/types/PageRow";

/** The rows that make a browser's run red: any with a failure, and, in Chromium, any it could not decode at all. */
export function browserFailures(engine: string, rows: readonly PageRow[]): PageRow[] {
  return rows.filter(row => (row.failures?.length ?? 0) > 0 || (engine === "chromium" && row.unsupported === true));
}
