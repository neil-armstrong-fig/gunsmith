import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** A ray walked in even steps: where it is after travelling a distance, how many steps it takes and how long each is. */
export interface RaySamples {
  /** The point the ray reaches after travelling `travelled` tiles. */
  pointAt: (travelled: number) => Point;
  /** How many steps the ray is walked in; the samples run from 0 to this, both ends included. */
  samples: number;
  /** The length of one step, in tiles. */
  step: number;
}
