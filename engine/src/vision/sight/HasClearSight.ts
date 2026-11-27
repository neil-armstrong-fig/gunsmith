import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {BlockedTiles} from "@gunsmith/engine/arena/types/BlockedTiles";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {EDGE_REACH_TILES} from "@gunsmith/engine/height/EdgeReach";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import type {Eye} from "@gunsmith/engine/height/types/Eye";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";
import type {LineEnd} from "@gunsmith/engine/vision/types/LineEnd";
import type {SightRequest} from "@gunsmith/engine/vision/types/SightRequest";

/**
 * Whether nothing stands on the line of sight from `sight.from` to `sight.to`. Walls always stop it, and a low cover block stops
 * a crouching viewer no higher than it (`blocksSightFrom`, judged by the viewer's eye wherever the block is). Between two ends on
 * one level, ground higher than that level stops it. Between two levels, raised floor may lie on the line only within
 * `EDGE_REACH_TILES` of the higher end: to look down off a platform you stand at its edge, and only there are you seen from
 * below. The line is then judged from the lower end up, so a fighter sees another across two levels exactly when they are seen.
 */
export function hasClearSight(arena: Arena, sight: SightRequest): boolean {
  const toLevel = eyeLevelAt(arena, sight.to);
  if (toLevel === sight.eye.eyeLevel) {
    return hasClearLine(blocksSightFrom(arena, sight.eye), sight.from, sight.to);
  }

  const lowerEnd = lowEndOf(sight, toLevel);
  const higherEnd = highEndOf(sight, toLevel);
  const edge = edgeOf(lowerEnd.point, higherEnd.point);

  return (
    hasClearLine(blockedAbove(arena, sight.eye, lowerEnd.level), lowerEnd.point, edge) &&
    hasClearLine(blockedAbove(arena, sight.eye, higherEnd.level), edge, higherEnd.point)
  );
}

function lowEndOf(sight: SightRequest, toLevel: number): LineEnd {
  if (toLevel < sight.eye.eyeLevel) {
    return {point: sight.to, level: toLevel};
  }

  return {point: sight.from, level: sight.eye.eyeLevel};
}

function highEndOf(sight: SightRequest, toLevel: number): LineEnd {
  if (toLevel > sight.eye.eyeLevel) {
    return {point: sight.to, level: toLevel};
  }

  return {point: sight.from, level: sight.eye.eyeLevel};
}

/** The point `EDGE_REACH_TILES` from the higher end towards the lower one, or the lower end itself when that is nearer. */
function edgeOf(lower: Point, higher: Point): Point {
  const length = Math.hypot(lower.x - higher.x, lower.y - higher.y);
  if (length <= EDGE_REACH_TILES) {
    return lower;
  }

  return {
    x: higher.x + ((lower.x - higher.x) / length) * EDGE_REACH_TILES,
    y: higher.y + ((lower.y - higher.y) / length) * EDGE_REACH_TILES,
  };
}

/** The tiles that stop a stretch of the line: walls and cover as the viewer's eye meets them, and floor higher than `level`. */
function blockedAbove(arena: Arena, eye: Eye, level: number): BlockedTiles {
  const blocksViewer = blocksSightFrom(arena, eye);

  return (tileX, tileY) => {
    if (isSolid(arena, tileX, tileY)) {
      return blocksViewer(tileX, tileY);
    }

    return levelOfTile(arena, tileX, tileY) > level;
  };
}
