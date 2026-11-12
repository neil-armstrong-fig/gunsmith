import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What a player is asking for this step. The engine does not trust it: see `step`. */
export interface Input {
  /** The way the player wants to walk. Anything longer than one is treated as one. */
  direction: Point;
  /** The place in the arena the player is aiming at, in tiles. Absent when nothing has been aimed. */
  aimAt?: Point;
  /** Whether the trigger is held down. */
  firing: boolean;
}
