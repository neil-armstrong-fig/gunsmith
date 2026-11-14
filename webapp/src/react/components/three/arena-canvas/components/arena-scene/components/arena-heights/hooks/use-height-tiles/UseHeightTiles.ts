import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {heightTilesOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/HeightTilesOf";
import type {HeightTiles} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/HeightTiles";
import {useMemo} from "react";

/** The raised floor and stairs to draw. Worked out once per arena: an arena does not change mid-match. */
export function useHeightTiles(arena: Arena): HeightTiles {
  return useMemo(() => heightTilesOf(arena), [arena]);
}
