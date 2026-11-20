import {SPAWN_SEED_SALT} from "@gunsmith/engine/arena-symmetry/spawn-pairs/SpawnSeedSalt";
import type {PlacePair} from "@gunsmith/engine/arena-symmetry/spawn-pairs/types/PlacePair";
import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";

/**
 * The places the two fighters start from one of `pairs`, drawn from the seed on a stream of its own (`SPAWN_SEED_SALT`): the first
 * draw picks the pair and a second draw on the same stream says which fighter takes which end, so neither is the one always put at
 * the lower tile. None means there is no pair to draw from.
 */
export function drawStartingPlaces(pairs: readonly PlacePair[], seed: number): StartingPlaces | undefined {
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
