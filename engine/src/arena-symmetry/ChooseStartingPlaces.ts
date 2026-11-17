import {isHalfTurnSymmetric} from "@gunsmith/engine/arena-symmetry/IsHalfTurnSymmetric";
import {spawnPairsOf} from "@gunsmith/engine/arena-symmetry/spawn-pairs/SpawnPairsOf";
import {SPAWN_SEED_SALT} from "@gunsmith/engine/arena-symmetry/spawn-pairs/SpawnSeedSalt";
import {SPAWN_SPACING_STEPS} from "@gunsmith/engine/arena-symmetry/spawn-pairs/SpawnSpacing";
import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";

/**
 * Where the two fighters of a round start, as a pair of tiles a half turn takes onto one another, so that each begins on the
 * ground the other would if the arena were turned: the pair is drawn from the seed on a stream of its own, and a second draw on
 * that stream says which fighter takes which end, so neither fighter is the one always put at the lower tile. It is `undefined`
 * for an arena that is not the same picture turned half way round, and for one with no pair `SPAWN_SPACING_STEPS` apart: no
 * unmatched pair is ever made up.
 */
export function chooseStartingPlaces(arena: Arena, seed: number): StartingPlaces | undefined {
  if (!isHalfTurnSymmetric(arena)) {
    return undefined;
  }

  const pairs = spawnPairsOf(arena, SPAWN_SPACING_STEPS);
  const pairDraw = nextRandom(seed ^ SPAWN_SEED_SALT);
  const pair = pairs[Math.floor(pairDraw.value * pairs.length)];
  if (!pair) {
    return undefined;
  }

  if (nextRandom(pairDraw.seed).value < 0.5) {
    return {player: pair.first, opponent: pair.second};
  }

  return {player: pair.second, opponent: pair.first};
}
