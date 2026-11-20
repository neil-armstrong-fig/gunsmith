import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What one fighter did in a step that makes a noise another fighter may hear. */
export interface NoiseOfFighter {
  /** Where the fighter stands after the step: where a shot and a footfall are heard from. */
  position: Point;
  /** Whether a shot left their weapon. */
  shot: boolean;
  /** Whether a foot came down (`isFootfall`). */
  footfall: boolean;
  /** Where the weapon lay that they took in this step, or `undefined` when they took none. */
  tookPickupAt: Point | undefined;
}
