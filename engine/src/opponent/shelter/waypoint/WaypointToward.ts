import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

const DIRECTIONS = 16;
const REACHES = [1.5, 3];

/**
 * The place to walk to on the way to `to`: `to` itself when no wall is in the straight line, and otherwise the nearest
 * point to it, among sixteen directions at two short reaches from `from`, that is in clear sight of `from` (so it is open floor too: a line to a wall tile is not clear);
 * a point that also sees `to` is preferred, so a pillar is walked round rather than walked into. With no such point it
 * takes the nearest it can reach, and with nowhere to go at all, `to`. There is no memory and no random draw, so the same
 * places always give the same answer, and the opponent has no pathfinder to keep.
 */
export function waypointToward(arena: Arena, from: Point, to: Point): Point {
  const solid = solidTilesOf(arena);
  if (hasClearLine(solid, from, to)) {
    return to;
  }

  const reachable = candidatesAround(from).filter(point => {
    return hasClearLine(solid, from, point);
  });
  const seeing = reachable.filter(point => {
    return hasClearLine(solid, point, to);
  });

  return nearestTo(to, seeing) ?? nearestTo(to, reachable) ?? to;
}

function candidatesAround(from: Point): Point[] {
  const candidates: Point[] = [];
  for (const reach of REACHES) {
    for (let index = 0; index < DIRECTIONS; index++) {
      const angle = (index / DIRECTIONS) * 2 * Math.PI;
      candidates.push({x: from.x + Math.cos(angle) * reach, y: from.y + Math.sin(angle) * reach});
    }
  }

  return candidates;
}

function nearestTo(target: Point, points: readonly Point[]): Point | undefined {
  let best: Point | undefined;
  let bestDistance = Infinity;
  for (const point of points) {
    const distance = Math.hypot(point.x - target.x, point.y - target.y);
    if (distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }

  return best;
}
