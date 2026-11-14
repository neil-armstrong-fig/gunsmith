import type {PageResult} from "@gunsmith/audio-studies/browser/run/types/PageResult";

/** One browser's whole run: which it was, what it decoded, and that it rejected both deliberately faulty files. */
export interface BrowserResult extends PageResult {
  engine: string;
  version: string;
  corruptionControl: "rejected";
  discontinuityControl: "rejected";
}
