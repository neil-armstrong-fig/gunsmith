import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";

/** The ring for a world that has an opponent: it closes on ground both fighters can walk to from where they start. */
export function ringOf(world: World, seed: number, timing: RingTiming): Ring {
  const starts = [world.player.position];
  if (world.opponent) {
    starts.push(world.opponent.position);
  }

  return startRing({arena: world.arena, starts, seed, timing});
}
