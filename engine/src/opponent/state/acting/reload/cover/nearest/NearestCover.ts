import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import type {CoverCandidates} from "@gunsmith/engine/opponent/state/acting/reload/cover/nearest/types/CoverCandidates";
import {walkingDistanceTo} from "@gunsmith/engine/opponent/state/walking/WalkingDistanceTo";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

/**
 * The nearest of the candidate places that is cover: out of the threat's sight by the sight rule (a wall, or ground higher than
 * the threat's eye, hides a place), and reachable on foot from `from`. Nearest is by the walk there (`walkingDistanceTo`), so
 * a place across a drop is as far as the stair. The first of two equally near places wins. Absent when no candidate qualifies.
 */
export function nearestCover(arena: Arena, request: CoverCandidates): Point | undefined {
  const hidesFromThreat = blocksSightFrom(arena, eyeLevelAt(arena, request.threat));
  let nearest: Point | undefined;
  let nearestDistance = Infinity;
  for (const candidate of request.candidates) {
    if (hasClearLine(hidesFromThreat, request.threat, candidate)) {
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
