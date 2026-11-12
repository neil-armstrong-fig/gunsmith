import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {BULLET_SPEED} from "@gunsmith/engine/bullet/flight/BulletSpeed";

/** A bullet is checked at least this often along its path, so a one-tile wall can never be jumped. */
const SAMPLE_SPACING = 0.1;

/** Flies every bullet on for `seconds` and returns the ones still in the air: a bullet that touches a wall is gone. */
export function advanceBullets(arena: Arena, bullets: readonly Bullet[], seconds: number): Bullet[] {
  const flying: Bullet[] = [];

  for (const bullet of bullets) {
    const advanced = advanceBullet(arena, bullet, seconds);
    if (advanced) {
      flying.push(advanced);
    }
  }

  return flying;
}

/** The bullet after its flight, or `undefined` when a wall was in the way, at the start or anywhere along it. */
function advanceBullet(arena: Arena, bullet: Bullet, seconds: number): Bullet | undefined {
  const distance = BULLET_SPEED * seconds;
  const samples = Math.max(1, Math.ceil(distance / SAMPLE_SPACING));
  let x = bullet.position.x;
  let y = bullet.position.y;

  for (let sample = 0; sample <= samples; sample += 1) {
    const travelled = (distance * sample) / samples;
    x = bullet.position.x + bullet.direction.x * travelled;
    y = bullet.position.y + bullet.direction.y * travelled;

    if (isSolid(arena, Math.floor(x), Math.floor(y))) {
      return undefined;
    }
  }

  return {position: {x, y}, direction: bullet.direction};
}
