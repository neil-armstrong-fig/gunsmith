import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What the player's bullets did to the opponent in one step: the health they took (zero when none hit), and where the player stood. */
export interface ShotRequest {
  bulletDamage: number;
  from: Point;
}
