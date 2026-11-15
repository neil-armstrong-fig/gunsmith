import type {Point} from "@src/dsl/gunsmith/types/Point";

/** A straight line across the arena, from one place to another in tiles, and how many evenly spaced pixels to read along it (both ends included). */
export interface ColourSampling {
  from: Point;
  to: Point;
  samples: number;
}
