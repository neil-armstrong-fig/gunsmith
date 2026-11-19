const MILLISECONDS_IN_A_DAY = 86_400_000;

/** The UTC day an instant (milliseconds since 1970) falls in, counted from 1970: it changes at 00:00 UTC. */
export function utcDay(now: number): number {
  return Math.floor(now / MILLISECONDS_IN_A_DAY);
}
