import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {secondsFromParameter} from "@src/game/scenario/ring-timing/seconds/SecondsFromParameter";

/**
 * The ring timing a page's query asks for: `?ringDelay=` is the seconds before the ring starts to close (nothing is
 * allowed: it starts at once) and `?ringClosing=` the seconds it takes to close (more than nothing). A timing that is
 * missing or is not a plain number keeps the game's own for that half, and a query that asks for neither has no timing
 * at all, so the page keeps the game's ring: a duel has the default one and sparring has none.
 */
export function ringTimingFromSearch(search: string): RingTiming | undefined {
  const startDelaySeconds = secondsFromParameter(search, "ringDelay");
  const closingSeconds = closingSecondsFromSearch(search);
  if (startDelaySeconds === undefined && closingSeconds === undefined) {
    return undefined;
  }

  return {
    startDelaySeconds: startDelaySeconds ?? DEFAULT_RING_TIMING.startDelaySeconds,
    closingSeconds: closingSeconds ?? DEFAULT_RING_TIMING.closingSeconds,
  };
}

/** The closing time the query asks for: more than nothing, since no ring can close in no time. */
function closingSecondsFromSearch(search: string): number | undefined {
  const asked = secondsFromParameter(search, "ringClosing");
  if (asked === 0) {
    return undefined;
  }

  return asked;
}
