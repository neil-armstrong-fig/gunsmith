import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {firingAt} from "@gunsmith/engine/game-loop/step/testing/FiringAt";

/** Holds the trigger toward the east for `heldTicks` steps, then lets go for `idleTicks` more. */
export function shoot(world: World, heldTicks: number, idleTicks: number): World {
  let later = world;
  for (let tick = 0; tick < heldTicks; tick += 1) {
    later = step(later, firingAt({x: 20, y: 4.5}), TICK);
  }

  for (let tick = 0; tick < idleTicks; tick += 1) {
    later = step(later, IDLE, TICK);
  }

  return later;
}
