import {fairStart} from "@gunsmith/engine/arena/symmetry/FairStart";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {pickupOf} from "@src/game/scenario/round/starting-parts/PickupOf";
import {ringOf} from "@src/game/scenario/round/starting-parts/RingOf";

/**
 * The duel played on any arena a player chose at the pre-round: the fighters on the fairest pair of places the arena has (`fairStart`), the
 * opponent's brain, a ring closing on ground both can reach and a weapon lying between them, all drawn from `seed`, in the first round of a
 * best-of-three. An arena the engine's own checks passed always has places to stand, so having none is a mistake in the caller.
 */
export function duelWorldOn(arena: Arena, seed: number, ringTiming?: RingTiming): World {
  const start = fairStart(arena, seed);
  if (!start) {
    throw new Error("The arena has no places for two fighters to start.");
  }

  const world = giveOpponentBrain(start, seed);

  return {
    ...world,
    match: startMatch(),
    ring: ringOf(world, seed, ringTiming ?? DEFAULT_RING_TIMING),
    pickup: pickupOf(world, seed),
  };
}
