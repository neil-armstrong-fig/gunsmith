import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

/** A stair: where it is, the level of its low end, and the way it climbs. */
export interface StairTile {
  x: number;
  y: number;
  level: number;
  uphill: Uphill;
}
