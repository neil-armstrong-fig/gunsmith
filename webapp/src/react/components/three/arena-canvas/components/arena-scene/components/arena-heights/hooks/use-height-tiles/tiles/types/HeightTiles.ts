import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

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

/** Everything in an arena that is not the low ground and not a wall. */
export interface HeightTiles {
  floors: RaisedFloor[];
  stairs: StairTile[];
}
