import type {ShakeRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-camera-shake/shake-offset/types/ShakeRequest";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** How long a hit shakes the camera, in seconds (art's study). */
const SHAKE_SECONDS = 0.1;
/** How quickly the shake swings, in radians a second. */
const SWING = 180;

/**
 * Where the shake has put the picture, in screen pixels (`x` to the right, `y` downwards), from art's study: horizontally `sin(age x 180) x pixels x (1 - age / 0.1)`,
 * damped to nothing as it ends, and vertically minus half of that, for the first 100 ms. Exactly still before and after, and at zero strength, so the camera
 * does not stop a hair off where it began. Pure: it is told the age.
 */
export function shakeOffset({age, pixels}: ShakeRequest): Point {
  if (pixels === 0 || age >= SHAKE_SECONDS) {
    return {x: 0, y: 0};
  }

  const x = Math.sin(age * SWING) * pixels * (1 - age / SHAKE_SECONDS);

  // `0 - …` rather than a minus sign, so that a shake of exactly zero at the instant of the hit is 0 and not -0.
  return {x, y: 0 - x / 2};
}
