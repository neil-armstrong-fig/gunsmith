import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {pushOutOfWalls} from "@gunsmith/engine/movement/PushOutOfWalls";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";

/**
 * Where a player ends up after walking the way `direction` asks for `seconds`, stopped by walls. The engine does not
 * trust the direction: anything longer than one is treated as one, so a client cannot walk faster by asking.
 */
export function movePlayer(arena: Arena, position: Point, direction: Point, seconds: number): Point {
  const length = Math.hypot(direction.x, direction.y);
  const scale = length > 1 ? 1 / length : 1;
  const distance = PLAYER_SPEED * seconds;

  const wanted = {
    x: position.x + direction.x * scale * distance,
    y: position.y + direction.y * scale * distance,
  };

  return pushOutOfWalls(arena, wanted, PLAYER_RADIUS);
}
