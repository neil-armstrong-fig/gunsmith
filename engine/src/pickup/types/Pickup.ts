import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** A weapon lying in the arena for a fighter to walk onto. It is gone once taken. */
export interface Pickup {
  /** The middle of the tile it lies on. */
  position: Point;
  /** The weapon a fighter holds the moment they take it. */
  weapon: Weapon;
}
