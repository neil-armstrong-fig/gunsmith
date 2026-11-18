import fc from "fast-check";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Places anywhere from `lowest` to `highest` on both axes. */
export function points(lowest: number, highest: number): fc.Arbitrary<Point> {
  return fc.record({
    x: fc.double({min: lowest, max: highest, noNaN: true}),
    y: fc.double({min: lowest, max: highest, noNaN: true}),
  });
}
