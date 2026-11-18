import {isCover} from "@gunsmith/engine/arena/IsCover";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";
import type {Eye} from "@gunsmith/engine/height/types/Eye";

/**
 * The tiles that stop the sight of a viewer looking from `eye.eyeLevel`: every wall, and every tile on a level higher than
 * theirs. So from the low ground a platform and what stands on it are hidden, and a platform's edge hides what is behind
 * it, while from a platform the ground below and the ground on its own level can be seen. A stair has the level of its low end.
 * A low cover block stops only a crouching viewer (a standing one sees over it) and only one no higher than it: a viewer on
 * higher ground sees over cover below them, crouching or not.
 */
export function blocksSightFrom(arena: Arena, eye: Eye): BlockedTiles {
  return (tileX, tileY) => {
    if (isCover(arena, tileX, tileY)) {
      return eye.crouching && levelOfTile(arena, tileX, tileY) >= eye.eyeLevel;
    }

    if (isSolid(arena, tileX, tileY)) {
      return true;
    }

    return levelOfTile(arena, tileX, tileY) > eye.eyeLevel;
  };
}
