import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * A shot in flight. It is a point: it moves at its own `speed` along `direction`, takes its own `damage` off what it
 * hits, and is gone when it touches a wall, a dummy or the fighter on the other side. Damage and speed come from the weapon that fired it.
 */
export interface Bullet {
  position: Point;
  /** A vector of length one. */
  direction: Point;
  /** What it takes off a dummy it hits. */
  damage: number;
  /** How fast it flies, in tiles per second. */
  speed: number;
  /** Whose it is: it hurts the other side, never its own. */
  shooter: Shooter;
  /** The level of the shooter's eye when it was fired, which it keeps: it flies over lower ground and stops at a tile higher than this. */
  level: number;
  /** Whether the shooter was crouching when it was fired: a crouched shooter's bullet is stopped by a low cover block, a standing one's flies over it. */
  crouching: boolean;
}
