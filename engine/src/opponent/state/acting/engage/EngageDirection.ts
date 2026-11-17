import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";
import {strafeDirection} from "@gunsmith/engine/opponent/steering/StrafeDirection";
import {walkToward} from "@gunsmith/engine/opponent/steering/WalkToward";
import type {StrafeRequest} from "@gunsmith/engine/opponent/steering/types/StrafeRequest";

/**
 * Where an engaging opponent walks: toward the player when farther than `farRange`, away when nearer than `nearRange`, and
 * sideways, circling, in between. All at the opponent's share of full speed. The range is judged by the player, but closing in
 * heads for `routeWaypoint`, so in an arena with a stair it goes round by the stair when a drop lies between them; with no
 * stair that is the player themself, as it always was.
 */
export function engageDirection(arena: Arena, request: StrafeRequest): Point {
  const offsetX = request.to.x - request.from.x;
  const offsetY = request.to.y - request.from.y;
  const distance = Math.hypot(offsetX, offsetY);

  if (distance > DIFFICULTY.farRange) {
    return walkToward(request.from, routeWaypoint(arena, request.from, request.to));
  }

  if (distance > 0 && distance < DIFFICULTY.nearRange) {
    return {x: (-offsetX / distance) * DIFFICULTY.speedShare, y: (-offsetY / distance) * DIFFICULTY.speedShare};
  }

  return strafeDirection(request);
}
