import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** What `fireBullet` is asked to fire: from where, the way the shooter faces, the weapon in hand, and how high they stand. */
export interface ShotRequest {
  /** The centre of the shooter's circle. */
  from: Point;
  /** The way the shooter faces, a vector of length one. */
  aim: Point;
  weapon: Weapon;
  /** The level of the shooter's eye, which the bullet keeps for its whole flight. */
  level: number;
}
