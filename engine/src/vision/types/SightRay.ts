import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Stretch} from "@gunsmith/engine/vision/types/Stretch";

/** One ray across a cone: the way it points from the apex, and the stretches along it the viewer sees, the first from the apex. */
export interface SightRay {
  direction: Point;
  seen: readonly Stretch[];
}
