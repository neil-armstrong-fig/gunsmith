import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The tiles beside cover gathered so far, and the indices of those already taken, so a tile beside two blocks is listed once. */
export interface TilesFound {
  seen: Set<number>;
  tiles: Point[];
}
