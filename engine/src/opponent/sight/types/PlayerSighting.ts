import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What one step shows the opponent of the player: whether it sees them, where they stand, and how long the step was. */
export interface PlayerSighting {
  sees: boolean;
  target: Point;
  seconds: number;
}
