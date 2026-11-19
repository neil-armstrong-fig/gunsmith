/** 00:00 UTC on the first of the next month, when a monthly stop ends. */
export function nextUtcMonthStart(now: number): number {
  const date = new Date(now);

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}
