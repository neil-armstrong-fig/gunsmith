import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";
import {EDGE_REACH_TILES} from "@gunsmith/engine/height/EdgeReach";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";

/** A bullet is checked at least this often along its path, so a one-tile wall can never be jumped. */
const SAMPLE_SPACING = 0.1;
/**
 * How far a bullet may fly onto ground higher than it was fired from: far enough to reach the body of someone standing within
 * `EDGE_REACH_TILES` of the edge, whom the shooter can see, and no farther.
 */
const ONTO_HIGHER_GROUND = EDGE_REACH_TILES - PLAYER_RADIUS;

/**
 * How far along its next `distance` the bullet first meets what stops it (zero when it starts in it), or `undefined` when nothing
 * does: a wall, a low cover block as the shooter's stance meets it (`blocksSightFrom`), or ground higher than its level once it has
 * flown `ONTO_HIGHER_GROUND` onto it. How far it has flown onto it is read off its own straight path behind it.
 */
export function distanceToStop(arena: Arena, bullet: Bullet, distance: number): number | undefined {
  const blocksShooter = blocksSightFrom(arena, {eyeLevel: bullet.level, crouching: bullet.crouching});
  const samples = Math.max(1, Math.ceil(distance / SAMPLE_SPACING));
  for (let sample = 0; sample <= samples; sample += 1) {
    const travelled = (distance * sample) / samples;
    const point = along(bullet, travelled);
    const tileX = Math.floor(point.x);
    const tileY = Math.floor(point.y);
    if (isSolid(arena, tileX, tileY)) {
      if (blocksShooter(tileX, tileY)) {
        return travelled;
      }
    } else if (
      isAbove(arena, point, bullet.level) &&
      isAbove(arena, along(bullet, travelled - ONTO_HIGHER_GROUND), bullet.level)
    ) {
      return travelled;
    }
  }

  return undefined;
}

function along(bullet: Bullet, travelled: number): Point {
  return {x: bullet.position.x + bullet.direction.x * travelled, y: bullet.position.y + bullet.direction.y * travelled};
}

function isAbove(arena: Arena, point: Point, level: number): boolean {
  return levelOfTile(arena, Math.floor(point.x), Math.floor(point.y)) > level;
}
