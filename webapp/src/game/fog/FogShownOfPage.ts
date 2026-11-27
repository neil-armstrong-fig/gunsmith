import {fogShownFromSearch} from "@src/game/fog/fog-shown/FogShownFromSearch";

/** Whether the page draws the fog's veil; always outside a browser, where there is no query to read. */
export function fogShownOfPage(): boolean {
  if (typeof location === "undefined") {
    return fogShownFromSearch("");
  }

  return fogShownFromSearch(location.search);
}
