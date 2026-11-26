import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hidesFrom} from "@gunsmith/engine/opponent/state/acting/reload/cover/HidesFrom";
import type {CoverCandidates} from "@gunsmith/engine/opponent/state/acting/reload/cover/nearest/types/CoverCandidates";
import {walkingDistanceTo} from "@gunsmith/engine/opponent/state/walking/WalkingDistanceTo";

/**
 * The nearest of the candidate places that is cover from the threat (`hidesFrom`: by walls, by height, or right behind a low cover
 * block) and reachable on foot from `from`. Nearest is by the walk there (`walkingDistanceTo`), so
 * a place across a drop is as far as the stair. The first of two equally near places wins. Absent when no candidate qualifies.
 */
export function nearestCover(arena: Arena, request: CoverCandidates): Point | undefined {
  let nearest: Point | undefined;
  let nearestDistance = Infinity;
  for (const candidate of request.candidates) {
    if (!hidesFrom(arena, request.threat, candidate)) {
      continue;
    }

    const distance = walkingDistanceTo(arena, request.from, candidate);
    if (distance !== undefined && distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  return nearest;
}
