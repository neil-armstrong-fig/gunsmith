import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {wallTilesOf} from "@src/react/components/three/arena-terrain/components/arena-walls/hooks/use-wall-tiles/tiles/WallTilesOf";
import {useMemo} from "react";

/** The wall tiles to draw. Worked out once per arena rather than on every render: an arena does not change mid-match. */
export function useWallTiles(arena: Arena): Point[] {
  return useMemo(() => wallTilesOf(arena), [arena]);
}
