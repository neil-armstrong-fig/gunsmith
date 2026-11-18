import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Where the player is drawn now, and where the newest prediction says they are. */
export interface CorrectionRequest {
  shown: Point;
  target: Point;
}
