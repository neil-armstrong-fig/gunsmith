import {isPlaceToStand} from "@gunsmith/engine/arena-symmetry/IsPlaceToStand";
import type {PlacePair} from "@gunsmith/engine/arena-symmetry/spawn-pairs/types/PlacePair";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {routeDistancesFrom} from "@gunsmith/engine/pickup/placement/RouteDistancesFrom";

/**
 * Every place two fighters could start, as a pair of tiles a half turn takes onto one another: both open floor on the same level,
 * neither a stair, one walked to from the other in at least `minimumSteps` steps. A tile is never paired with itself. The pairs
 * come in the order of their first tile, rows from the south, so the same arena always lists them the same way. It says nothing
 * of whether the arena is symmetrical (`isHalfTurnSymmetric`): a pair is only ever a tile and its image, and for an arena that
 * is not the same picture turned, the two ends may differ in more than what is checked here. None means no fair start exists.
 */
export function spawnPairsOf(arena: Arena, minimumSteps: number): readonly PlacePair[] {
  const pairs: PlacePair[] = [];
  const lastIndex = arena.solid.length - 1;

  for (let index = 0; index < lastIndex - index; index += 1) {
    const image = lastIndex - index;
    if (isPlaceToStand(arena, index) && isPlaceToStand(arena, image) && arena.levels[index] === arena.levels[image]) {
      const first = centreOf(arena, index);
      const second = centreOf(arena, image);
      if ((routeDistancesFrom(arena, first).get(image) ?? -1) >= minimumSteps) {
        pairs.push({first, second});
      }
    }
  }

  return pairs;
}

function centreOf(arena: Arena, index: number): Point {
  return {x: (index % arena.width) + 0.5, y: Math.floor(index / arena.width) + 0.5};
}
