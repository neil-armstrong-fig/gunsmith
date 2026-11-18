import {shakePixelsFromSearch} from "@src/game/motion/shake/ShakePixelsFromSearch";

/** How hard the page asks the camera to shake at a hit, in pixels; the default strength outside a browser, where there is no query to read. */
export function shakePixelsOfPage(): number {
  if (typeof location === "undefined") {
    return shakePixelsFromSearch("");
  }

  return shakePixelsFromSearch(location.search);
}
