import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";

/**
 * The tiles that stop the sight of a viewer looking from `eyeLevel`: every wall, and every tile on a level higher than
 * theirs. So from the low ground a platform and what stands on it are hidden, and a platform's edge hides what is behind
 * it, while from a platform the ground below and the ground on its own level can be seen. A stair has the level of its low end.
 */
export function blocksSightFrom(arena: Arena, eyeLevel: number): BlockedTiles {
  return (tileX, tileY) => {
    if (isSolid(arena, tileX, tileY)) {
      return true;
    }

    return levelOfTile(arena, tileX, tileY) > eyeLevel;
  };
}
