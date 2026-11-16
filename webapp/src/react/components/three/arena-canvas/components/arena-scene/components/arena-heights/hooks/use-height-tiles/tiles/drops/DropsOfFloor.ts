import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {DROP_FACINGS} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/drops/types/DropFacing";
import {dropsAway} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/drops/away/DropsAway";
import type {DropEdge} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/DropEdge";
import type {RaisedFloor} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/RaisedFloor";

/** The edges of one raised floor tile that drop to lower ground, one for each side it drops away on. */
export function dropsOfFloor(arena: Arena, floor: RaisedFloor): DropEdge[] {
  return DROP_FACINGS.filter(facing => dropsAway(arena, floor, facing)).map(facing => ({
    x: floor.x,
    y: floor.y,
    facing,
  }));
}
