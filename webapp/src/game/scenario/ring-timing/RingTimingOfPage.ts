import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {ringTimingFromSearch} from "@src/game/scenario/ring-timing/from-search/RingTimingFromSearch";

/**
 * The ring timing the page was opened for, or nothing when its query asks for none (or outside a browser, where there is no
 * query to read). The same every time, so the next round of a match keeps the ring the page asked for.
 */
export function ringTimingOfPage(): RingTiming | undefined {
  if (typeof location === "undefined") {
    return undefined;
  }

  return ringTimingFromSearch(location.search);
}
