import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";

/** A bullet is checked at least this often along its path, so a one-tile wall can never be jumped. */
const SAMPLE_SPACING = 0.1;

/** How far along its next `distance` the bullet first finds a wall (zero when it starts in one); `undefined` when clear. */
export function distanceToWall(arena: Arena, bullet: Bullet, distance: number): number | undefined {
  const samples = Math.max(1, Math.ceil(distance / SAMPLE_SPACING));

  for (let sample = 0; sample <= samples; sample += 1) {
    const travelled = (distance * sample) / samples;
    const x = bullet.position.x + bullet.direction.x * travelled;
    const y = bullet.position.y + bullet.direction.y * travelled;

    if (isSolid(arena, Math.floor(x), Math.floor(y))) {
      return travelled;
    }
  }

  return undefined;
}
