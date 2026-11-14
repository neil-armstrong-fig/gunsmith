import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The places to choose cover from, for someone at `from` hiding from `threat`. */
export interface CoverCandidates {
  from: Point;
  threat: Point;
  candidates: readonly Point[];
}
