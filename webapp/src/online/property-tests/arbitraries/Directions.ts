import fc from "fast-check";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The eight ways the keys can send a player, and standing still. */
export function directions(): fc.Arbitrary<Point> {
  return fc.record({x: fc.constantFrom(-1, 0, 1), y: fc.constantFrom(-1, 0, 1)});
}
