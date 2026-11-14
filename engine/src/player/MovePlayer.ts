import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {pushOutOfWalls} from "@gunsmith/engine/movement/PushOutOfWalls";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import type {Walk} from "@gunsmith/engine/player/types/Walk";
import {CROUCH_SPEED_FACTOR} from "@gunsmith/engine/player/walking/CrouchSpeedFactor";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";

/**
 * Where a player ends up after walking the way `walk.direction` asks for `walk.seconds`, stopped by walls, and slower
 * when crouching. The engine does not trust the direction: anything longer than one is treated as one, so a client cannot
 * walk faster by asking.
 */
export function movePlayer(arena: Arena, walk: Walk): Point {
  const {position, direction, seconds, crouching} = walk;
  const length = Math.hypot(direction.x, direction.y);
  const scale = length > 1 ? 1 / length : 1;
  const speed = crouching ? PLAYER_SPEED * CROUCH_SPEED_FACTOR : PLAYER_SPEED;
  const distance = speed * seconds;

  const wanted = {
    x: position.x + direction.x * scale * distance,
    y: position.y + direction.y * scale * distance,
  };

  return pushOutOfWalls(arena, wanted, PLAYER_RADIUS);
}
