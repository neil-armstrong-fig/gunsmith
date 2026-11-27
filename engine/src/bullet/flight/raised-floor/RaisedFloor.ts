import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";

/** The path is looked along this often, so no step up onto a tile is missed. */
const SAMPLE_SPACING = 0.1;

/**
 * The bullet's `floor` after it flies `distance` on: raised to the level of any floor it passes up onto from floor no higher than
 * its floor. Past a second platform's edge it is far beyond the shooter's reach, so, as sight does, it passes over the low ground
 * behind that platform. Flying off the shooter's own platform is a step down, and leaves the floor as it is.
 */
export function raisedFloor(arena: Arena, bullet: Bullet, distance: number): number {
  const samples = Math.max(1, Math.ceil(distance / SAMPLE_SPACING));
  let floor = bullet.floor;
  let previous = levelAlong(arena, bullet, 0);
  for (let sample = 1; sample <= samples; sample += 1) {
    const level = levelAlong(arena, bullet, (distance * sample) / samples);
    if (previous <= floor && level > floor) {
      floor = level;
    }

    previous = level;
  }

  return floor;
}

function levelAlong(arena: Arena, bullet: Bullet, travelled: number): number {
  const x = bullet.position.x + bullet.direction.x * travelled;
  const y = bullet.position.y + bullet.direction.y * travelled;

  return levelOfTile(arena, Math.floor(x), Math.floor(y));
}
