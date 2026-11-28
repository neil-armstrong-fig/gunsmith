import {ARENA_LIMITS} from "@gunsmith/engine/arena/limits/ArenaLimits";
import {isPlaceToStand} from "@gunsmith/engine/arena/symmetry/IsPlaceToStand";
import {floorShareOf} from "@gunsmith/engine/arena/validation/floor-share/FloorShareOf";
import {openRegionsOf} from "@gunsmith/engine/arena/validation/regions/OpenRegionsOf";
import type {ArenaProblem} from "@gunsmith/engine/arena/validation/types/ArenaProblem";
import {whereIsTile} from "@gunsmith/engine/arena/drawing/stairs/WhereIsTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

const NO_STARTING_PLACES_REASON =
  "The arena has fewer than two places to stand, so the two fighters cannot both start.";

/**
 * Everything structurally wrong with an arena, all of it at once so that a repair can be asked for in one go, or nothing at
 * all when it can be played. It reads the arena and never throws, unlike `arenaFrom`, which stops at the first fault in a
 * drawing. The floor must be one piece a walker can cross, a stair the only way between levels: the largest piece (the first
 * of equals) is the arena, and every other piece is reported by its first tile and its size, in the order those tiles come.
 * An arena with no way to start both fighters (no stretch of floor with two places to stand on one level) is reported next, and
 * too little open floor (`ARENA_LIMITS.floorShare`) last, each for the arena as a whole. Whether the arena is fair is
 * not asked here.
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

  if (!hasTwoPlacesToStand(arena, regions)) {
    problems.push({kind: "noStartingPlaces", reason: NO_STARTING_PLACES_REASON, tile: undefined});
  }

  const floorShare = floorShareOf(arena);
  if (floorShare < ARENA_LIMITS.floorShare.min) {
    problems.push({kind: "tooWalled", reason: describeTooWalled(arena, floorShare), tile: undefined});
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

/**
 * Whether some stretch of floor has two places to stand (`isPlaceToStand`) on one level, which is all `fairStart` needs to start both
 * fighters. It asks every region rather than the largest, so the answer is the same however the arena is turned, and an arena that
 * validates is one region, so it is that region.
 */
function hasTwoPlacesToStand(arena: Arena, regions: readonly (readonly Point[])[]): boolean {
  return regions.some(region => {
    const placesOnLevel = new Map<number, number>();
    for (const tile of region) {
      const index = Math.floor(tile.y) * arena.width + Math.floor(tile.x);
      if (isPlaceToStand(arena, index)) {
        const level = arena.levels[index] ?? 0;
        placesOnLevel.set(level, (placesOnLevel.get(level) ?? 0) + 1);
      }
    }

    return [...placesOnLevel.values()].some(places => places >= 2);
  });
}

function describeCutOff(arena: Arena, region: readonly Point[]): string {
  const [first] = region;
  const where = first ? whereIsTile(arena.height, {x: Math.floor(first.x), y: Math.floor(first.y)}) : "nowhere";

  return `${region.length} tiles of floor, starting at ${where}, cannot be walked to from the rest of the arena.`;
}

function describeTooWalled(arena: Arena, floorShare: number): string {
  const floor = arena.solid.filter(solid => !solid).length;
  const asked = Math.round(ARENA_LIMITS.floorShare.min * 100);

  return `Open floor is only ${floor} of ${arena.width * arena.height} tiles (${Math.round(floorShare * 100)}%); at least ${asked}% of the arena must be open floor.`;
}
