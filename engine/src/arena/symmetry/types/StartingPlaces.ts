import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Where the two fighters start: tile centres a half turn takes onto one another, the player on one and the opponent on the other. */
export interface StartingPlaces {
  player: Point;
  opponent: Point;
}
