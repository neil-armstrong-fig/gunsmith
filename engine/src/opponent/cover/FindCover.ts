import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {nearestCover} from "@gunsmith/engine/opponent/cover/nearest/NearestCover";
import type {CoverDraw} from "@gunsmith/engine/opponent/cover/types/CoverDraw";
import type {CoverRequest} from "@gunsmith/engine/opponent/cover/types/CoverRequest";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {randomOpenPoint} from "@gunsmith/engine/opponent/steering/RandomOpenPoint";

/**
 * Looks for somewhere to hide to reload: tries `coverSamples` random open places within `coverReach` of the opponent and
 * takes the nearest that the threat cannot see and the opponent can walk straight to. Absent when none of the tries
 * qualifies (an open room, or bad luck), and the opponent then reloads in the open. Only a sample of places is tried, so
 * the answer depends on the seed, and the seed comes back moved on.
 */
export function findCover(arena: Arena, request: CoverRequest): CoverDraw {
  const candidates: Point[] = [];
  let seed = request.seed;
  for (let sample = 0; sample < DIFFICULTY.coverSamples; sample++) {
    const draw = randomOpenPoint(arena, seed, {centre: request.from, radius: DIFFICULTY.coverReach});
    seed = draw.seed;
    if (draw.point) {
      candidates.push(draw.point);
    }
  }

  return {cover: nearestCover(arena, {from: request.from, threat: request.threat, candidates}), seed};
}
