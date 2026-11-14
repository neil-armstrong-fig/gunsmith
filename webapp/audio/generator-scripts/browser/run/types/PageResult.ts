import type {PageRow} from "@gunsmith/audio-studies/browser/run/types/PageRow";

/** What the page printed when it finished: every export's row, or the error that stopped it. */
export interface PageResult {
  userAgent?: string;
  rows?: PageRow[];
  error?: string;
}
