import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";

/**
 * How a room's ring runs, from what the first page to reach it showed: `?ringDelay=` is the seconds before the ring starts to close
 * and `?ringClosing=` the seconds it then takes, a tuning seam so a spec need not wait 75 seconds, like `?preRoundSeconds=`. It can only
 * be made sooner or faster than the real ring (a delay of nothing starts it at once; a closing time of nothing or less is the real one),
 * so a page cannot switch the ring off for the other player. A value that is not a number is left out, and when the page asks for
 * neither it gives `undefined` and the room keeps the real ring. The query is `unknown` text until read here.
 */
export function parseRingTiming(search: URLSearchParams): RingTiming | undefined {
  const delay = numberAsked(search, "ringDelay");
  const closing = numberAsked(search, "ringClosing");
  if (delay === undefined && closing === undefined) {
    return undefined;
  }

  return {
    startDelaySeconds: Math.min(DEFAULT_RING_TIMING.startDelaySeconds, Math.max(0, delay ?? Infinity)),
    closingSeconds: closingOrReal(closing),
  };
}

/** The closing time asked for, never longer than the real one, and the real one when the page asks for none or for nothing. */
function closingOrReal(closing: number | undefined): number {
  if (closing === undefined || closing <= 0) {
    return DEFAULT_RING_TIMING.closingSeconds;
  }

  return Math.min(DEFAULT_RING_TIMING.closingSeconds, closing);
}

/** The number the query holds under `name`, or `undefined` when it holds nothing or something that is not a finite number. */
function numberAsked(search: URLSearchParams, name: string): number | undefined {
  const asked = search.get(name);
  if (asked === null || asked.trim() === "") {
    return undefined;
  }

  const seconds = Number(asked);
  if (!Number.isFinite(seconds)) {
    return undefined;
  }

  return seconds;
}
