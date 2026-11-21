import {FOOTSTEP_INTERVAL_SECONDS} from "@gunsmith/engine/sound/footsteps/cadence/FootstepIntervalSeconds";
import type {Footstep} from "@gunsmith/engine/sound/footsteps/types/Footstep";
import type {StepRequest} from "@gunsmith/engine/sound/footsteps/types/StepRequest";

const MOVEMENT_EPSILON_TILES = 0.000001;

/** The first moving tick of an upright walk lands immediately. Continuous movement keeps the walking cadence. */
export function footstepOf({before, after, crouching, seconds, previous}: StepRequest): Footstep | undefined {
  if (crouching || Math.hypot(after.x - before.x, after.y - before.y) <= MOVEMENT_EPSILON_TILES) {
    return undefined;
  }

  if (!previous) return {elapsedSeconds: 0, landed: true};

  const elapsedSeconds = previous.elapsedSeconds + seconds;
  if (elapsedSeconds < FOOTSTEP_INTERVAL_SECONDS) return {elapsedSeconds, landed: false};

  return {elapsedSeconds: elapsedSeconds % FOOTSTEP_INTERVAL_SECONDS, landed: true};
}
