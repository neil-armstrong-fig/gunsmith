import {landingIndex} from "@gunsmith/engine/arena/drawing/stairs/LandingIndex";
import {uphillStep} from "@gunsmith/engine/arena/drawing/stairs/UphillStep";
import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";

/**
 * Checks each stair's landings, then gives the stair the level of the floor behind it. It throws for a stair with no plain floor
 * behind or ahead of it, or whose far landing is not exactly one level higher than its near one. Changes `arena` in place.
 */
export function placeStairs(arena: DrawnArena): void {
  for (let index = 0; index < arena.stairs.length; index += 1) {
    const uphill = arena.stairs[index];
    if (uphill === undefined) {
      continue;
    }

    const x = index % arena.width;
    const y = Math.floor(index / arena.width);
    const step = uphillStep(uphill);
    const behind = landingIndex(arena, {x: x - step.x, y: y - step.y});
    const ahead = landingIndex(arena, {x: x + step.x, y: y + step.y});
    const where = `column ${x + 1}, row ${arena.height - y}`;

    if (behind === undefined || ahead === undefined) {
      throw new Error(`The stair at ${where} needs plain floor behind it and ahead of it.`);
    }

    const lowLevel = arena.levels[behind] ?? 0;
    if (arena.levels[ahead] !== lowLevel + 1) {
      throw new Error(`The stair at ${where} must climb to floor one level higher than the floor behind it.`);
    }

    arena.levels[index] = lowLevel;
  }
}
