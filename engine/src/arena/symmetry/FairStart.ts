import {chooseStartingPlaces} from "@gunsmith/engine/arena/symmetry/ChooseStartingPlaces";
import {drawStartingPlaces} from "@gunsmith/engine/arena/symmetry/spawn-pairs/DrawStartingPlaces";
import {matchedDistancePairs} from "@gunsmith/engine/arena/symmetry/spawn-pairs/matched-distances/MatchedDistancePairs";
import {SPAWN_SPACING_STEPS} from "@gunsmith/engine/arena/symmetry/spawn-pairs/SpawnSpacing";
import {startAtPlaces} from "@gunsmith/engine/arena/symmetry/StartAtPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";

/**
 * A round about to be fought on any arena, with the two fighters on places that are as fair as the arena allows, each facing the
 * middle. An arena that is the same picture turned half way round starts them on a pair a half turn takes onto one another
 * (`chooseStartingPlaces`). Any other arena, or one with no such pair far enough apart, starts them on a pair that is the most nearly
 * the same walk from the middle (`matchedDistancePairs`), which is as fair as an arena that is not symmetrical can be. The seed
 * draws the pair and who takes which end. It is `undefined` only for an arena with fewer than two places to stand, which
 * `validateArena` refuses. Nothing else is set up: no ring, no pickup, no opponent brain.
 */
export function fairStart(arena: Arena, seed: number): World | undefined {
  const places =
    chooseStartingPlaces(arena, seed) ?? drawStartingPlaces(matchedDistancePairs(arena, SPAWN_SPACING_STEPS), seed);
  if (!places) {
    return undefined;
  }

  return startAtPlaces(startingWorld(arena, [], places.opponent), places);
}
