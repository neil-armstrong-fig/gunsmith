import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Where the opponent was when it last checked it was getting anywhere, and how long ago that was. */
export interface StuckWatch {
  anchor: Point;
  seconds: number;
}
