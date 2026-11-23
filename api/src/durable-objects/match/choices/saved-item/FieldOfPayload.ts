/** One field of a stored payload, still `unknown`, or `undefined` when the payload is not an object. */
export function fieldOfPayload(payload: unknown, field: string): unknown {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  return (payload as Record<string, unknown>)[field];
}
