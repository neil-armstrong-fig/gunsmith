import {preRoundFromSearch} from "@src/game/pre-round/from-search/PreRoundFromSearch";

/** Whether the page was opened asking for the duel's pre-round, or not outside a browser, where there is no query to read. */
export function preRoundOfPage(): boolean {
  if (typeof location === "undefined") {
    return false;
  }

  return preRoundFromSearch(location.search);
}
