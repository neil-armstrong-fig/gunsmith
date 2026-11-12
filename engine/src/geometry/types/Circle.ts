import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A disc on the arena floor. */
export interface Circle {
  centre: Point;
  radius: number;
}
