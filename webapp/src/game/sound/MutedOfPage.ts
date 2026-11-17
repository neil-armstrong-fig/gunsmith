import {mutedFromSearch} from "@src/game/sound/muted/MutedFromSearch";

/** Whether the page was opened silent, or not outside a browser, where there is no query to read. */
export function mutedOfPage(): boolean {
  if (typeof location === "undefined") {
    return false;
  }

  return mutedFromSearch(location.search);
}
