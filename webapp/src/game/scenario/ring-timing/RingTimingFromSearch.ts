import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {numberFromParameter} from "@src/game/scenario/ring-timing/number/NumberFromParameter";

/**
 * The ring a page's query asks for: `?ringDelay=` is the seconds before the ring starts to close (nothing is allowed: it
 * starts at once), `?ringClosing=` the seconds it takes to close (more than nothing) and `?ringDamage=` how many times the
 * normal damage it does (more than nothing, so it can still decide a round). One that is missing or is not a plain number
 * keeps the game's own, and a query that asks for none of the three has no timing at all, so the page keeps the game's
 * ring: a duel has the default one and sparring has none.
 */
export function ringTimingFromSearch(search: string): RingTiming | undefined {
  const startDelaySeconds = numberFromParameter(search, "ringDelay");
  const closingSeconds = moreThanNothingFromSearch(search, "ringClosing");
  const damageScale = moreThanNothingFromSearch(search, "ringDamage");
  if (startDelaySeconds === undefined && closingSeconds === undefined && damageScale === undefined) {
    return undefined;
  }

  const timing = {
    startDelaySeconds: startDelaySeconds ?? DEFAULT_RING_TIMING.startDelaySeconds,
    closingSeconds: closingSeconds ?? DEFAULT_RING_TIMING.closingSeconds,
  };
  if (damageScale === undefined) {
    return timing;
  }

  return {...timing, damageScale};
}

/** The number the query asks for, when it is more than nothing: no ring closes in no time, and one that hurts nothing never decides a round. */
function moreThanNothingFromSearch(search: string, name: string): number | undefined {
  const asked = numberFromParameter(search, name);
  if (asked === 0) {
    return undefined;
  }

  return asked;
}
