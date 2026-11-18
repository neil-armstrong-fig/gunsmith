import {transformArena} from "@gunsmith/engine/arena-symmetry/transform/TransformArena";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";

/**
 * Whether the arena is the same picture when turned half way round: every tile has, at the place a half turn takes it to, a
 * tile with the same wall or cover block, the same level and a stair climbing the opposite way. It says nothing of whether the arena can be
 * played; that is `validateArena`'s question. A stair on the centre tile of an arena of odd width and height is never its own
 * image, since a half turn turns it to climb the other way.
 */
export function isHalfTurnSymmetric(arena: Arena): boolean {
  const turned = transformArena(arena, "halfTurn");

  for (let index = 0; index < arena.solid.length; index += 1) {
    if (
      arena.solid[index] !== turned.solid[index] ||
      arena.cover[index] !== turned.cover[index] ||
      arena.levels[index] !== turned.levels[index] ||
      arena.stairs[index] !== turned.stairs[index]
    ) {
      return false;
    }
  }

  return true;
}
