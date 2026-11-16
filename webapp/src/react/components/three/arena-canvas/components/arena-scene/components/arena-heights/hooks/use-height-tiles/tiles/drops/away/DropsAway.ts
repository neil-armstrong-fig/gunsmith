import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {DropFacing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/drops/types/DropFacing";
import {neighbourOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/drops/away/neighbour/NeighbourOf";
import type {RaisedFloor} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/types/types/RaisedFloor";

/** Whether the raised floor drops to lower open ground on its `facing` side: a wall or a stair there is not a drop, and the stair is the way up. */
export function dropsAway(arena: Arena, floor: RaisedFloor, facing: DropFacing): boolean {
  const beside = neighbourOf(floor, facing);
  if (isSolid(arena, beside.x, beside.y) || stairOfTile(arena, beside.x, beside.y) !== undefined) {
    return false;
  }

  return levelOfTile(arena, beside.x, beside.y) < floor.level;
}
