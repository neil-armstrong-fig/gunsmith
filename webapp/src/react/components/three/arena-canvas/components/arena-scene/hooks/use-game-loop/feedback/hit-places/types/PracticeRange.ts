import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {World} from "@gunsmith/engine/game-loop/types/World";

/** The practice range as `HitPlacesOfStep`'s tests use it. */
export interface PracticeRange {
  /** The range, the player facing the first dummy. */
  world: World;
  /** Where the dummy the player faces stands. */
  seen: Point;
  /** Where the second dummy stands, behind the player. */
  unseen: Point;
}
