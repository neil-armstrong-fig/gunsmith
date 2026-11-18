import {reducedMotionFromSearch} from "@src/game/motion/reduced-motion/ReducedMotionFromSearch";

const PREFERS_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether the person wants less motion: the page was opened asking for it, or their system says so. Not so outside a browser, where there is neither. */
export function reducedMotionOfPage(): boolean {
  if (typeof location === "undefined") {
    return false;
  }

  if (reducedMotionFromSearch(location.search)) {
    return true;
  }

  return typeof matchMedia === "function" && matchMedia(PREFERS_REDUCED_MOTION).matches;
}
