import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A line that starts at `position` and runs on forever along `direction`. */
export interface Ray {
  position: Point;
  /** A vector of length one. */
  direction: Point;
}
