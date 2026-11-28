/** How far, in screen pixels, a hit shakes the camera at its strongest by default: the user chose 12 after trying 8 and 16 (2026-11-18); art's study said 2, which they could not see. */
const DEFAULT_SHAKE_PIXELS = 12;

/**
 * How hard the camera shakes at a hit, as the page's query (`?shake=<pixels>`) asks: `0` is off, and the user tunes it in context with it. A value that is not a
 * non-negative number of pixels is ignored, so a typo does not turn the shake off or send the picture flying.
 */
export function shakePixelsFromSearch(search: string): number {
  const asked = new URLSearchParams(search).get("shake");
  if (asked === null || asked === "") {
    return DEFAULT_SHAKE_PIXELS;
  }

  const pixels = Number(asked);
  if (!Number.isFinite(pixels) || pixels < 0) {
    return DEFAULT_SHAKE_PIXELS;
  }

  return pixels;
}
