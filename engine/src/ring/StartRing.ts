import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {reachableCentre} from "@gunsmith/engine/ring/centre/ReachableCentre";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingRequest} from "@gunsmith/engine/ring/types/RingRequest";

/**
 * The ring of a round that has just begun: none of the round has been played, it closes on a point the fighters can walk
 * to (drawn from the seed), and it reaches as far as the arena's farthest corner from that point, so it covers all of it.
 */
export function startRing(request: RingRequest): Ring {
  const {arena, timing} = request;
  const centre = reachableCentre(request);
  const corners: readonly Point[] = [
    {x: 0, y: 0},
    {x: arena.width, y: 0},
    {x: 0, y: arena.height},
    {x: arena.width, y: arena.height},
  ];
  const startRadius = Math.max(...corners.map(corner => Math.hypot(corner.x - centre.x, corner.y - centre.y)));

  return {roundSeconds: 0, centre, startRadius, timing};
}
