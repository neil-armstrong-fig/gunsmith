import {isCover} from "@gunsmith/engine/arena/IsCover";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {COVER_REACH_TILES} from "@gunsmith/engine/cover/CoverReach";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

/**
 * Whether a cover block stands on the line from `from` to `target`, no farther from `target` than `COVER_REACH_TILES`: the
 * block a crouched fighter is behind. A block nearer the viewer than that, or a wall, is not one: a wall hides by stopping
 * sight, and a block near the viewer hides nobody far behind it. A block covers only a target on its own level: one on the low
 * ground beside a platform's edge hides nobody up on the platform (a target on a stair is judged by its upper level, as sight does).
 */
export function coverBesideTarget(arena: Arena, from: Point, target: Point): boolean {
  const length = Math.hypot(target.x - from.x, target.y - from.y);
  if (length === 0) {
    return false;
  }

  const reach = Math.min(COVER_REACH_TILES, length);
  const start = {
    x: target.x - ((target.x - from.x) / length) * reach,
    y: target.y - ((target.y - from.y) / length) * reach,
  };

  const level = eyeLevelAt(arena, target);

  return !hasClearLine(
    (tileX, tileY) => isCover(arena, tileX, tileY) && levelOfTile(arena, tileX, tileY) === level,
    start,
    target,
  );
}
