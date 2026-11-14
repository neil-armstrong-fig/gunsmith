import type {RecordCompletion} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/types/RecordCompletion";

/**
 * Fills the fields of a record that are absent from `defaults`, in the order `defaults` lists them, and labels each with the
 * prefix and the field's name. A field that is there (anything but `undefined`) is never touched, whatever it holds. Returns a new record.
 */
export function completeRecord(
  record: Record<string, unknown>,
  defaults: Record<string, unknown>,
  prefix: string,
): RecordCompletion {
  const completed = {...record};
  const changes: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    if (completed[key] === undefined) {
      completed[key] = value;
      changes.push(`${prefix}${key}`);
    }
  }

  return {record: completed, changes};
}
