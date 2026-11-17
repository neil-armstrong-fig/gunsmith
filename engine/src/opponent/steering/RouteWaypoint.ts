import {hasStairs} from "@gunsmith/engine/arena/HasStairs";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blockedFrom} from "@gunsmith/engine/height/BlockedFrom";
import {levelAt} from "@gunsmith/engine/height/LevelAt";
import {tilePathBetween} from "@gunsmith/engine/route/TilePathBetween";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

/**
 * The place to walk to on the way to `goal` when a stair may be in the way: `goal` itself when the arena has no stair, when
 * the walker is on the goal's level with nothing blocking the straight line (`blockedFrom`), or when there is no way there at
 * all (so it walks as it always has); otherwise the middle of the next tile along the shortest walk, which crosses a drop by its
 * stair. The last tile on the way is the goal itself, not its tile's middle. A step is longer than the arrival radius, so the
 * walker never counts as having arrived before it has left its tile. It keeps nothing and draws nothing, so the same places
 * always give the same answer.
 */
export function routeWaypoint(arena: Arena, from: Point, goal: Point): Point {
  if (!hasStairs(arena) || canWalkStraight(arena, from, goal)) {
    return goal;
  }

  const path = tilePathBetween(arena, from, goal);
  const next = path?.[1];
  if (!path || !next || path.length === 2) {
    return goal;
  }

  return next;
}

function canWalkStraight(arena: Arena, from: Point, goal: Point): boolean {
  const goalLevel = levelOfTile(arena, Math.floor(goal.x), Math.floor(goal.y));

  return levelAt(arena, from) === goalLevel && hasClearLine(blockedFrom(arena, from), from, goal);
}
