import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {STRIDE_TILES} from "@gunsmith/engine/sound/footsteps/StrideTiles";
import type {StepRequest} from "@gunsmith/engine/sound/footsteps/types/StepRequest";

const SECONDS_PER_STRIDE = STRIDE_TILES / PLAYER_SPEED;

/**
 * Whether a fighter's foot comes down in this step: they walked (their place changed), they are not crouched (crouching is silent),
 * and the game clock crossed the end of a stride. The stride is a fixed time, since walking has one speed, so the engine keeps no
 * count of strides and the same steps always give the same footfalls.
 */
export function isFootfall({before, after, crouching, elapsedSeconds, seconds}: StepRequest): boolean {
  if (crouching) {
    return false;
  }

  if (before.x === after.x && before.y === after.y) {
    return false;
  }

  return Math.floor((elapsedSeconds + seconds) / SECONDS_PER_STRIDE) > Math.floor(elapsedSeconds / SECONDS_PER_STRIDE);
}
