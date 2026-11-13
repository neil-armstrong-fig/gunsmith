import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Circle} from "@gunsmith/engine/geometry/types/Circle";
import type {OpenPointDraw} from "@gunsmith/engine/opponent/steering/types/OpenPointDraw";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";

const ATTEMPTS = 8;

/**
 * Looks for the centre of an open tile inside `around`, by trying a few random tiles in the part of the arena the circle
 * covers. It may find none (a few tries, so a small clearing in a walled-in region can be missed), and the caller treats
 * that as "not this time". The seed it hands back has moved on, found or not, so the next look is a different one.
 */
export function randomOpenPoint(arena: Arena, seed: number, around: Circle): OpenPointDraw {
  const firstX = Math.max(0, Math.floor(around.centre.x - around.radius));
  const firstY = Math.max(0, Math.floor(around.centre.y - around.radius));
  const lastX = Math.min(arena.width - 1, Math.floor(around.centre.x + around.radius));
  const lastY = Math.min(arena.height - 1, Math.floor(around.centre.y + around.radius));
  let current = seed;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const drawX = nextRandom(current);
    const drawY = nextRandom(drawX.seed);
    current = drawY.seed;
    const tileX = firstX + Math.floor(drawX.value * (lastX - firstX + 1));
    const tileY = firstY + Math.floor(drawY.value * (lastY - firstY + 1));
    const point = {x: tileX + 0.5, y: tileY + 0.5};
    if (
      !isSolid(arena, tileX, tileY) &&
      Math.hypot(point.x - around.centre.x, point.y - around.centre.y) <= around.radius
    ) {
      return {point, seed: current};
    }
  }

  return {point: undefined, seed: current};
}
