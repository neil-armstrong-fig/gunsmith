import {step} from "@gunsmith/engine/game-loop/Step";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";

/** Plays `ticks` steps of `input`. */
export function playTicks(world: World, input: Input, ticks: number): World {
  let later = world;
  for (let tick = 0; tick < ticks; tick += 1) {
    later = step(later, input, TICK);
  }

  return later;
}
