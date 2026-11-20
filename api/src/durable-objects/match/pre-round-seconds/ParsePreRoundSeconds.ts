import {DEFAULT_PRE_ROUND_SECONDS} from "@src/durable-objects/match/pre-round/DefaultPreRoundSeconds";

/**
 * How long a room gives its two seats to choose, from what the first page to reach it showed (`?preRoundSeconds=`): a tuning seam so a
 * spec need not wait a minute, like `?reconnectSeconds=`. It can only be made shorter than the real time, and `0` (or less) means none:
 * the match begins on the defaults as the second seat sits, which is how every spec that is not about choosing keeps today's start.
 * Anything that is not a number is the real time. The query is `unknown` text until read here.
 */
export function parsePreRoundSeconds(search: URLSearchParams): number {
  const asked = search.get("preRoundSeconds");
  if (asked === null || asked.trim() === "") {
    return DEFAULT_PRE_ROUND_SECONDS;
  }

  const seconds = Number(asked);
  if (!Number.isFinite(seconds)) {
    return DEFAULT_PRE_ROUND_SECONDS;
  }

  return Math.min(DEFAULT_PRE_ROUND_SECONDS, Math.max(0, seconds));
}
