import {DEFAULT_FORFEIT_LIMITS} from "@src/match/room/DefaultForfeitLimits";
import type {ForfeitLimits} from "@src/match/room/types/ForfeitLimits";

/** No limit is shortened below this: a page cannot forfeit a player the moment they blink. */
const SHORTEST_LIMIT_SECONDS = 1;

/**
 * How long a room waits for a player, from what the first page to reach it showed (`?reconnectSeconds=` and `?idleSeconds=`): a tuning seam
 * so a spec need not wait 30 seconds, like the page's `?lag=`. A limit can only be made shorter than the real one, and no shorter than a
 * second; anything that is not a number is the real limit. The query is `unknown` text until read here.
 */
export function parseForfeitLimits(search: URLSearchParams): ForfeitLimits {
  return {
    reconnectSeconds: shortened(search.get("reconnectSeconds") ?? undefined, DEFAULT_FORFEIT_LIMITS.reconnectSeconds),
    idleSeconds: shortened(search.get("idleSeconds") ?? undefined, DEFAULT_FORFEIT_LIMITS.idleSeconds),
  };
}

/** What `asked` makes of a limit that is really `real` seconds. `asked` is `undefined` when the query has no such field. */
function shortened(asked: string | undefined, real: number): number {
  if (asked === undefined || asked.trim() === "") {
    return real;
  }

  const seconds = Number(asked);
  if (!Number.isFinite(seconds)) {
    return real;
  }

  return Math.min(real, Math.max(SHORTEST_LIMIT_SECONDS, seconds));
}
