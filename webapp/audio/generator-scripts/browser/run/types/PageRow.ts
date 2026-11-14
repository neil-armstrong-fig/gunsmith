/** One export as a browser decoded it. A browser that cannot decode the format at all gives `unsupported` and its error instead. */
export interface PageRow {
  name: string;
  unsupported?: boolean;
  error?: string;
  frames?: number;
  channels?: number;
  peak?: number;
  rmsDbfs?: number;
  /** The step from the last frame back to the first. */
  join?: number;
  /** How far a loop played three times differs from the decoded loop repeated. Music only. */
  repeatError?: number;
  /** What the browser found wrong: `channels`, `duration`, `silence/clipping`, `join`, `repetition` or `crouch level`. */
  failures?: string[];
}
