import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A shot in flight. It is a point: it moves at `BULLET_SPEED` along `direction` and is gone when it touches a wall. */
export interface Bullet {
  position: Point;
  /** A vector of length one. */
  direction: Point;
}
