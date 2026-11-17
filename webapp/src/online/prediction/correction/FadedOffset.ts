import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The time an offset takes to fade to about a third of itself, in seconds: it is mostly gone after twice this, about a tenth of a second. A tunable. */
const FADE_SECONDS = 0.1;

/** An offset smaller than this many tiles is not worth carrying and becomes none: no one sees it. */
const NOT_WORTH_CARRYING = 0.001;

/** The offset after `seconds` more have passed: the same share goes each step, so it slides to nothing without overshooting or changing direction. */
export function fadedOffset(offset: Point, seconds: number): Point {
  const remaining = Math.exp(-seconds / FADE_SECONDS);
  const faded = {x: offset.x * remaining, y: offset.y * remaining};

  if (Math.hypot(faded.x, faded.y) < NOT_WORTH_CARRYING) {
    return {x: 0, y: 0};
  }

  return faded;
}
