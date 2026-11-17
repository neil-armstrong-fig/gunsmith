import {openRegionsOf} from "@gunsmith/engine/arena-validation/regions/OpenRegionsOf";
import type {ArenaProblem} from "@gunsmith/engine/arena-validation/types/ArenaProblem";
import {whereIsTile} from "@gunsmith/engine/arena/drawing/stairs/WhereIsTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Everything structurally wrong with an arena, all of it at once so that a repair can be asked for in one go, or nothing at
 * all when it can be played. It reads the arena and never throws, unlike `arenaFrom`, which stops at the first fault in a
 * drawing. The floor must be one piece a walker can cross, a stair the only way between levels: the largest piece (the first
 * of equals) is the arena, and every other piece is reported by its first tile and its size, in the order those tiles come.
 * Whether the arena is fair is not asked here.
 */
export function validateArena(arena: Arena): readonly ArenaProblem[] {
  const regions = openRegionsOf(arena);
  const arenaRegion = largestOf(regions);
  if (!arenaRegion) {
    return [{kind: "noFloor", reason: "The arena has no floor to stand on.", tile: undefined}];
  }

  const problems: ArenaProblem[] = [];
  for (const region of regions) {
    if (region !== arenaRegion) {
      problems.push({kind: "disconnected", reason: describeCutOff(arena, region), tile: region[0]});
    }
  }

  return problems;
}

function largestOf(regions: readonly (readonly Point[])[]): readonly Point[] | undefined {
  let largest: readonly Point[] | undefined;
  for (const region of regions) {
    if (!largest || region.length > largest.length) {
      largest = region;
    }
  }

  return largest;
}

function describeCutOff(arena: Arena, region: readonly Point[]): string {
  const [first] = region;
  const where = first ? whereIsTile(arena.height, {x: Math.floor(first.x), y: Math.floor(first.y)}) : "nowhere";

  return `${region.length} tiles of floor, starting at ${where}, cannot be walked to from the rest of the arena.`;
}
