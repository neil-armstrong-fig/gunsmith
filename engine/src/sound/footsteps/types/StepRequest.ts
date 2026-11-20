import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Footstep} from "@gunsmith/engine/sound/footsteps/types/Footstep";

/** What `footstepOf` is told about one fighter in one step. */
export interface StepRequest {
  /** Where the fighter stood before the step. */
  before: Point;
  /** Where they stand after walking it. */
  after: Point;
  /** Whether they are crouched after the step. */
  crouching: boolean;
  /** Progress from the previous tick, if the fighter was walking upright. */
  previous: Footstep | undefined;
  /** The game time the step covers. */
  seconds: number;
}
