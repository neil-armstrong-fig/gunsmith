import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What a player is asking for this step. The engine does not trust it: see `step`. */
export interface Input {
  /** The way the player wants to walk. Anything longer than one is treated as one. */
  direction: Point;
  /** The place in the arena the player is aiming at, in tiles. Absent when nothing has been aimed. */
  aimAt?: Point;
  /** Whether the trigger is held down. */
  firing: boolean;
  /** Whether the crouch key is held. Absent means standing, which is what the opponent always asks for. */
  crouching?: boolean;
  /** Whether the player is asking for a reload this step. It has no effect on a full magazine or an empty reserve. */
  reload: boolean;
  /** The slot of the weapon the player is asking for this step (1 is the first). Absent when nothing is asked for. */
  switchTo?: number;
}
