import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Two tiles a half turn takes onto one another, as tile centres, the one with the lower place in the drawing first (rows from the south). */
export interface PlacePair {
  first: Point;
  second: Point;
}
