import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Who is looking for cover, from whom, and the seed to choose places to try with. */
export interface CoverRequest {
  from: Point;
  threat: Point;
  seed: number;
}
