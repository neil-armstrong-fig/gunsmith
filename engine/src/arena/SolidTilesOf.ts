import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";

/** The tiles that are walls and nothing else, for what a raised floor does not stop: a bullet's flight, and a line a walker only needs clear of walls. */
export function solidTilesOf(arena: Arena): BlockedTiles {
  return (tileX, tileY) => {
    return isSolid(arena, tileX, tileY);
  };
}
