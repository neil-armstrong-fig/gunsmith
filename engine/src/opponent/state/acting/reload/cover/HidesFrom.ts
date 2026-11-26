import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

/**
 * Whether `place` is cover from `threat`: out of their sight by the sight rule (a wall, or ground higher than their eye), or right
 * behind a low cover block on the line to them, where a crouched fighter is hidden (`coverBesideTarget`). The threat is taken to
 * stand, so a low cover block hides a place only that way, never by blocking their sight.
 */
export function hidesFrom(arena: Arena, threat: Point, place: Point): boolean {
  const blocksThreat = blocksSightFrom(arena, {eyeLevel: eyeLevelAt(arena, threat), crouching: false});

  return !hasClearLine(blocksThreat, threat, place) || coverBesideTarget(arena, threat, place);
}
