import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";

/**
 * The direction to ask `step` for to walk from `from` to `to`: a straight line, at the opponent's share of full speed
 * (the engine caps a direction's length at one, so asking for less is a slower walk). Within the arrival radius it has
 * arrived and asks for nothing. Walls are not its concern: `pushOutOfWalls` slides it along them.
 */
export function walkToward(from: Point, to: Point): Point {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  if (distance < DIFFICULTY.arrivalRadius) {
    return {x: 0, y: 0};
  }

  return {
    x: ((to.x - from.x) / distance) * DIFFICULTY.speedShare,
    y: ((to.y - from.y) / distance) * DIFFICULTY.speedShare,
  };
}
