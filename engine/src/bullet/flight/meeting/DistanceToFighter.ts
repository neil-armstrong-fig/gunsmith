import {distanceToCircle} from "@gunsmith/engine/bullet/flight/meeting/DistanceToCircle";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";

/**
 * How far along its path the bullet first touches a fighter standing at `position`, if that is within the next
 * `distance`; `undefined` when there is no fighter, or the bullet does not reach one this step.
 */
export function distanceToFighter(position: Point | undefined, bullet: Bullet, distance: number): number | undefined {
  if (!position) {
    return undefined;
  }

  const reached = distanceToCircle(bullet, {centre: position, radius: PLAYER_RADIUS});
  if (reached === undefined || reached > distance) {
    return undefined;
  }

  return reached;
}
