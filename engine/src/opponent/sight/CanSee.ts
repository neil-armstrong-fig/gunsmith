import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {hasClearLine} from "@gunsmith/engine/opponent/sight/HasClearLine";

/**
 * Whether the opponent at `from` sees `target`: within `sightRange` and with no wall between them. The range is a
 * stand-in until the arena's vision cone arrives; it has no angle yet, so the opponent sees all the way round.
 */
export function canSee(arena: Arena, from: Point, target: Point): boolean {
  if (Math.hypot(target.x - from.x, target.y - from.y) > DIFFICULTY.sightRange) {
    return false;
  }

  return hasClearLine(arena, from, target);
}
