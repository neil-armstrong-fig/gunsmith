import type {Point} from "@gunsmith/engine/geometry/types/Point";

export interface Player {
  /** The centre of the player's circle. */
  position: Point;
  /** The way the player faces, a vector of length one. */
  aim: Point;
  /** How long until the weapon can fire again; zero when it is ready. */
  cooldownSeconds: number;
}
