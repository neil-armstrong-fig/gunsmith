import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {dropsOfFloor} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/drops/DropsOfFloor";
import {tilePositionsOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/positions/TilePositionsOf";
import type {HeightTiles} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/HeightTiles";

/** The raised floor, the stairs and the drop edges of an arena, each south to north and west to east. Low ground and walls are none of them. */
export function heightTilesOf(arena: Arena): HeightTiles {
  const heightTiles: HeightTiles = {floors: [], stairs: [], drops: []};

  for (const {x, y} of tilePositionsOf(arena)) {
    const level = levelOfTile(arena, x, y);
    const uphill = stairOfTile(arena, x, y);

    if (uphill !== undefined) {
      heightTiles.stairs.push({x, y, level, uphill});
    } else if (level > 0) {
      heightTiles.floors.push({x, y, level});
      heightTiles.drops.push(...dropsOfFloor(arena, {x, y, level}));
    }
  }

  return heightTiles;
}
