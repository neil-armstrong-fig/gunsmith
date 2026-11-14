import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** One step of walking: where the player stands, the way they ask to go, for how long, and whether they are crouching. */
export interface Walk {
  position: Point;
  /** The way the player wants to walk. Anything longer than one is treated as one. */
  direction: Point;
  seconds: number;
  /** Whether the player is crouching, which keeps only part of their speed. */
  crouching: boolean;
}
