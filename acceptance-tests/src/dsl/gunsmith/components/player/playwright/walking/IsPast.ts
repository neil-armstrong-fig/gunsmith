import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** Whether `position` is beyond `limit` along the axis `heading` walks: `x` for east and west, `y` for north and south (the arena's `y` grows north). Exactly on it is not past. */
export function isPast(position: Point, heading: Heading, limit: number): boolean {
  if (heading === "east") {
    return position.x > limit;
  }

  if (heading === "west") {
    return position.x < limit;
  }

  if (heading === "north") {
    return position.y > limit;
  }

  return position.y < limit;
}
