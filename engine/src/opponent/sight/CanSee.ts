import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {canSeeFighter} from "@gunsmith/engine/vision/sight/CanSeeFighter";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import type {SeenFighter} from "@gunsmith/engine/vision/types/SeenFighter";

/**
 * Whether the opponent sees `target`: it is inside the opponent's own cone (as wide and as far as the weapon in its hand
 * allows, along the way it faces) and no wall or higher ground stands between and, if `target` crouches, no cover block right
 * beside them, the same test the player's view goes through. It has to turn to look, so it sees nothing behind it.
 */
export function canSee(arena: Arena, opponent: Player, target: SeenFighter): boolean {
  return canSeeFighter(arena, coneOf(arena, opponent), target);
}
