import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

/** One tile along the way a stair climbs, as a step in `x` and `y`. */
export function uphillStep(uphill: Uphill): Point {
  if (uphill === "north") {
    return {x: 0, y: 1};
  }

  if (uphill === "south") {
    return {x: 0, y: -1};
  }

  if (uphill === "east") {
    return {x: 1, y: 0};
  }

  return {x: -1, y: 0};
}
