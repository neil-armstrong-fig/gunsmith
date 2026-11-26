import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {tilesBesideCover} from "@gunsmith/engine/cover/TilesBesideCover";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {nearestCover} from "@gunsmith/engine/opponent/state/acting/reload/cover/nearest/NearestCover";
import type {CoverDraw} from "@gunsmith/engine/opponent/state/acting/reload/cover/types/CoverDraw";
import type {CoverRequest} from "@gunsmith/engine/opponent/state/acting/reload/cover/types/CoverRequest";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {randomOpenPoint} from "@gunsmith/engine/opponent/steering/RandomOpenPoint";

/**
 * Looks for somewhere to hide to reload: tries `coverSamples` random open places within `coverReach` of the opponent, then the
 * middle of every open tile beside a low cover block within that reach (so the nearest place behind a block is taken at the first
 * look, not after several), and takes the nearest by the walk there that the threat cannot see (`nearestCover`: by walls, by height and by a
 * block right beside it) and the opponent can walk to. Absent when none qualifies (an open room, or bad luck), and the opponent
 * then reloads in the open. The random tries make the answer depend on the seed, and the seed comes back moved on by them alone.
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

  for (const tile of tilesBesideCover(arena, {centre: request.from, radius: DIFFICULTY.coverReach})) {
    candidates.push({x: tile.x + 0.5, y: tile.y + 0.5});
  }

  return {cover: nearestCover(arena, {from: request.from, threat: request.threat, candidates}), seed};
}
