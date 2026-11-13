import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import type {StrafeRequest} from "@gunsmith/engine/opponent/steering/types/StrafeRequest";

/**
 * The direction to ask `step` for to circle a target: at right angles to the line to it, to its left for side 1 and its
 * right for side -1, at the opponent's share of full speed. On top of the target there is no line, so it asks for nothing.
 */
export function strafeDirection(request: StrafeRequest): Point {
  const offsetX = request.to.x - request.from.x;
  const offsetY = request.to.y - request.from.y;
  const distance = Math.hypot(offsetX, offsetY);
  if (distance === 0) {
    return {x: 0, y: 0};
  }

  return {
    x: (-offsetY / distance) * request.side * DIFFICULTY.speedShare,
    y: (offsetX / distance) * request.side * DIFFICULTY.speedShare,
  };
}
