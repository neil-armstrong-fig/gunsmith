import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {coverTilesOf} from "@src/react/components/three/arena-terrain/components/arena-walls/hooks/use-cover-tiles/tiles/CoverTilesOf";
import {useMemo} from "react";

/** The low cover blocks to draw. Worked out once per arena rather than on every render: an arena does not change mid-match. */
export function useCoverTiles(arena: Arena): Point[] {
  return useMemo(() => coverTilesOf(arena), [arena]);
}
