import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** One end of a line of sight between two levels: where it is and the level it looks from. */
export interface LineEnd {
  point: Point;
  level: number;
}
