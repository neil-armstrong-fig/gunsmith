import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {strafeDirection} from "@gunsmith/engine/opponent/steering/StrafeDirection";
import type {StrafeRequest} from "@gunsmith/engine/opponent/steering/types/StrafeRequest";

/**
 * Where an engaging opponent walks: toward the player when farther than `farRange`, away when nearer than `nearRange`, and
 * sideways, circling, in between. All at the opponent's share of full speed.
 */
export function engageDirection(request: StrafeRequest): Point {
  const offsetX = request.to.x - request.from.x;
  const offsetY = request.to.y - request.from.y;
  const distance = Math.hypot(offsetX, offsetY);

  if (distance > DIFFICULTY.farRange) {
    return {x: (offsetX / distance) * DIFFICULTY.speedShare, y: (offsetY / distance) * DIFFICULTY.speedShare};
  }

  if (distance > 0 && distance < DIFFICULTY.nearRange) {
    return {x: (-offsetX / distance) * DIFFICULTY.speedShare, y: (-offsetY / distance) * DIFFICULTY.speedShare};
  }

  return strafeDirection(request);
}
