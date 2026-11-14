/** The files the exporter and the checks write beside the exports. A new encode removes all three, so none is ever stale. */
export const REPORT_FILES = {
  /** What was encoded: the inventory, and the last thing published. */
  encoding: "report.json",
  /** What the native decoder found. */
  verification: "verification.json",
  /** What each browser's decoder found. */
  browser: "browser-verification.json",
} as const;
