import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What placing a shot's picture needs of a bullet: where it is, and the way it flies (a vector of length one). */
export interface FlyingShot {
  position: Point;
  direction: Point;
}
