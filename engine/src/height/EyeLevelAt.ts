import {levelAt} from "@gunsmith/engine/height/LevelAt";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The level a viewer at `point` looks from: the level of their ground, or the upper of the two levels a stair joins, so a viewer on a stair sees the landing they are about to step onto. */
export function eyeLevelAt(arena: Arena, point: Point): number {
  return Math.ceil(levelAt(arena, point));
}
