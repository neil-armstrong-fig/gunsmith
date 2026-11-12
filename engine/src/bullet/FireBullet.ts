import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";

/** How far past the edge of the player's circle a bullet starts, so it never begins inside the one who fired it. */
const MUZZLE_GAP = 0.1;

/** A new bullet leaving a player at `from`, who is facing `aim`. */
export function fireBullet(from: Point, aim: Point): Bullet {
  const distance = PLAYER_RADIUS + MUZZLE_GAP;

  return {
    position: {x: from.x + aim.x * distance, y: from.y + aim.y * distance},
    direction: {x: aim.x, y: aim.y},
  };
}
