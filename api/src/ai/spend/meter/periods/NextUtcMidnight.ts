import {utcDay} from "@src/ai/utc/UtcDay";

const MILLISECONDS_IN_A_DAY = 86_400_000;

/** The coming 00:00 UTC, when the daily credits and the daily spend come back. */
export function nextUtcMidnight(now: number): number {
  return (utcDay(now) + 1) * MILLISECONDS_IN_A_DAY;
}
