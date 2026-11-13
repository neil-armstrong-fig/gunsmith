import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What one step tells the stuck check: where the opponent is, whether it is trying to walk, and how long the step was. */
export interface StuckLook {
  position: Point;
  walking: boolean;
  seconds: number;
}
