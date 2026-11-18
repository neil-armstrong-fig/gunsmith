import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A fighter, as a viewer is asked whether they see them: where they stand and whether they crouch, which a cover block beside them can hide. */
export interface SeenFighter {
  position: Point;
  crouching: boolean;
}
