/** The most a page may be made to lag each way (`?lag=`), in milliseconds: a longer one is no longer a connection a player would sit through. */
const LONGEST_LAG = 2000;

/**
 * How many milliseconds `?lag=<ms>` asks each frame, each way, to be held up, to feel the game over a slower connection than the one at hand
 * (a way to try prediction on localhost, like the query that sets the ring's timing). Zero for no `lag`, or anything but a whole number from
 * 1 up; a longer one is cut to two seconds.
 */
export function lagOfSearch(search: string): number {
  const asked = new URLSearchParams(search).get("lag");
  if (!asked || !/^\d+$/.test(asked)) {
    return 0;
  }

  return Math.min(LONGEST_LAG, Number(asked));
}
