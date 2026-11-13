import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {StrafeSide} from "@gunsmith/engine/opponent/types/StrafeSide";

/** Who circles whom, and to which side. */
export interface StrafeRequest {
  from: Point;
  to: Point;
  side: StrafeSide;
}
