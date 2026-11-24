import {DEFAULT_REVEAL_SECONDS} from "@src/durable-objects/match/pre-round/DefaultRevealSeconds";

/**
 * How long a room shows its decided arena and weapons before the match begins, from what the first page to reach it showed
 * (`?revealSeconds=`): a tuning seam so a spec need not wait half a minute, like `?preRoundSeconds=`. It can only be made shorter than the
 * real time, and `0` (or less) means none: the match begins as soon as the pre-round is decided, which is how every spec that is not about
 * the reveal keeps its start. Anything that is not a number is the real time. The query is `unknown` text until read here.
 */
export function parseRevealSeconds(search: URLSearchParams): number {
  const asked = search.get("revealSeconds");
  if (asked === null || asked.trim() === "") {
    return DEFAULT_REVEAL_SECONDS;
  }

  const seconds = Number(asked);
  if (!Number.isFinite(seconds)) {
    return DEFAULT_REVEAL_SECONDS;
  }

  return Math.min(DEFAULT_REVEAL_SECONDS, Math.max(0, seconds));
}
