const MONTHS_IN_A_YEAR = 12;

/** The UTC month an instant falls in, counted on from January 1970: it changes at 00:00 UTC on the first. */
export function utcMonth(now: number): number {
  const date = new Date(now);

  return date.getUTCFullYear() * MONTHS_IN_A_YEAR + date.getUTCMonth();
}
