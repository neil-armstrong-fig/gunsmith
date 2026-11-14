import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {HeightTiles} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/HeightTiles";

/** The raised floor and the stairs of an arena, each south to north and west to east. Low ground and walls are neither. */
export function heightTilesOf(arena: Arena): HeightTiles {
  const heightTiles: HeightTiles = {floors: [], stairs: []};

  for (let y = 0; y < arena.height; y += 1) {
    for (let x = 0; x < arena.width; x += 1) {
      const level = levelOfTile(arena, x, y);
      const uphill = stairOfTile(arena, x, y);

      if (uphill !== undefined) {
        heightTiles.stairs.push({x, y, level, uphill});
      } else if (level > 0) {
        heightTiles.floors.push({x, y, level});
      }
    }
  }

  return heightTiles;
}
