/** Whether a value is a plain record of named fields: an object that is neither null nor a list. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
