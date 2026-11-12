import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * A shot in flight. It is a point: it moves at its own `speed` along `direction`, takes its own `damage` off what it
 * hits, and is gone when it touches a wall or a dummy. Both come from the weapon that fired it.
 */
export interface Bullet {
  position: Point;
  /** A vector of length one. */
  direction: Point;
  /** What it takes off a dummy it hits. */
  damage: number;
  /** How fast it flies, in tiles per second. */
  speed: number;
}
