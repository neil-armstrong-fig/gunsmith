import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {canSeePoint} from "@gunsmith/engine/vision/CanSeePoint";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";

/**
 * Whether the opponent sees `target`: it is inside the opponent's own cone (as wide and as far as the weapon in its hand
 * allows, along the way it faces) and no wall stands between, the same test the player's view goes through. It has to turn
 * to look, so it sees nothing behind it.
 */
export function canSee(arena: Arena, opponent: Player, target: Point): boolean {
  return canSeePoint(arena, coneOf(opponent), target);
}
