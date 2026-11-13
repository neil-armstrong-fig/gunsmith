import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {CoverCandidates} from "@gunsmith/engine/opponent/cover/nearest/types/CoverCandidates";
import {hasClearLine} from "@gunsmith/engine/opponent/sight/HasClearLine";

/**
 * The nearest of the candidate places that is cover: out of the threat's sight, and reachable from `from` in a straight
 * line (so the opponent can walk there without a map of the arena). The first of two equally near places wins. Absent
 * when no candidate qualifies.
 */
export function nearestCover(arena: Arena, request: CoverCandidates): Point | undefined {
  let nearest: Point | undefined;
  let nearestDistance = Infinity;
  for (const candidate of request.candidates) {
    const distance = Math.hypot(candidate.x - request.from.x, candidate.y - request.from.y);
    if (
      distance < nearestDistance &&
      !hasClearLine(arena, request.threat, candidate) &&
      hasClearLine(arena, request.from, candidate)
    ) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  return nearest;
}
