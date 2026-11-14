import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";
import type {DropFacing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/drops/types/DropFacing";

/** A tile of raised floor: where it is, in tiles, and the level it is on. */
export interface RaisedFloor {
  x: number;
  y: number;
  level: number;
}

/** A stair: where it is, the level of its low end, and the way it climbs. */
export interface StairTile {
  x: number;
  y: number;
  level: number;
  uphill: Uphill;
}

/** The edge of a raised tile that drops to lower ground: the tile, and the side it drops away on. */
export interface DropEdge {
  x: number;
  y: number;
  facing: DropFacing;
}

/** Everything in an arena that is not the low ground and not a wall. */
export interface HeightTiles {
  floors: RaisedFloor[];
  stairs: StairTile[];
  drops: DropEdge[];
}
