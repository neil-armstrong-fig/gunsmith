/** A record with its absent fields filled, and a label for each one filled. */
export interface RecordCompletion {
  record: Record<string, unknown>;
  changes: string[];
}
