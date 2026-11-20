import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What `isFootfall` is told about one fighter in one step. */
export interface StepRequest {
  /** Where the fighter stood before the step. */
  before: Point;
  /** Where they stand after walking it. */
  after: Point;
  /** Whether they are crouched after the step. */
  crouching: boolean;
  /** Game time at the start of the step, in seconds. */
  elapsedSeconds: number;
  /** The game time the step covers. */
  seconds: number;
}
