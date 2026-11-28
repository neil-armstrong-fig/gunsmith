import type {AxisFlips} from "@gunsmith/engine/arena/symmetry/transform/types/AxisFlips";
import type {ArenaTransform} from "@gunsmith/engine/arena/symmetry/transform/types/ArenaTransform";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {TileStair} from "@gunsmith/engine/arena/types/TileStair";
import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

const OPPOSITE: Readonly<Record<Uphill, Uphill>> = {north: "south", south: "north", east: "west", west: "east"};

/**
 * The arena turned half way round, or mirrored east to west or north to south: every tile moves, with its wall, its cover, its level and
 * its stair, a stair climbing the opposite way along every axis that was flipped. What can be walked to from where stays
 * the same, so whatever a check says of an arena it must say of this one.
 */
export function transformArena(arena: Arena, transform: ArenaTransform): Arena {
  const solid: boolean[] = [];
  const cover: boolean[] = [];
  const levels: number[] = [];
  const stairs: TileStair[] = [];

  for (let index = 0; index < arena.solid.length; index += 1) {
    const x = index % arena.width;
    const y = Math.floor(index / arena.width);
    const flipX = transform !== "mirrorNorthSouth";
    const flipY = transform !== "mirrorEastWest";
    const moved = (flipY ? arena.height - 1 - y : y) * arena.width + (flipX ? arena.width - 1 - x : x);

    solid[moved] = arena.solid[index] ?? false;
    cover[moved] = arena.cover[index] ?? false;
    levels[moved] = arena.levels[index] ?? 0;
    stairs[moved] = flippedStair(arena.stairs[index], {flipX, flipY});
  }

  return {...arena, solid, cover, levels, stairs};
}

function flippedStair(stair: TileStair, {flipX, flipY}: AxisFlips): TileStair {
  if (stair === undefined) {
    return undefined;
  }

  const alongX = stair === "east" || stair === "west";
  if ((alongX && flipX) || (!alongX && flipY)) {
    return OPPOSITE[stair];
  }

  return stair;
}
