import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** One tile on the ground a walker can reach: its middle, and the middle of the tile they stepped from to get there (none for the one they started on). */
export interface WalkStep {
  tile: Point;
  cameFrom: Point | undefined;
}
