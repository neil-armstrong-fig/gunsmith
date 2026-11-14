import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {DropFacing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/drops/types/DropFacing";

/** The tile next to `tile` on its `facing` side. */
export function neighbourOf(tile: Point, facing: DropFacing): Point {
  if (facing === "west") {
    return {x: tile.x - 1, y: tile.y};
  }

  if (facing === "east") {
    return {x: tile.x + 1, y: tile.y};
  }

  if (facing === "south") {
    return {x: tile.x, y: tile.y - 1};
  }

  return {x: tile.x, y: tile.y + 1};
}
