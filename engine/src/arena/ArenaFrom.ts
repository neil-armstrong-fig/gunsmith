import {COVER} from "@gunsmith/engine/arena/drawing/Cover";
import {STAIRS} from "@gunsmith/engine/arena/drawing/Stairs";
import {WALL} from "@gunsmith/engine/arena/drawing/Wall";
import {levelOfCharacter} from "@gunsmith/engine/arena/drawing/LevelOfCharacter";
import {placeStairs} from "@gunsmith/engine/arena/drawing/PlaceStairs";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";

/**
 * Reads an arena off a drawing: `#` is a wall, `c` is a low cover block (solid, on the low ground), `.` is floor on the low
 * ground, `1` and `2` are floor one and two levels up, and an arrow (`^` `v` `<` `>`) is a stair that climbs the way it points. The first row is the top (north), as it is
 * drawn, so `y` grows upwards in the arena the way it does on screen. A stair needs plain floor behind it and ahead of
 * it, the far one a level higher: that is its landing at each end.
 */
export function arenaFrom(rows: readonly string[]): Arena {
  const firstRow = rows[0];
  if (firstRow === undefined) {
    throw new Error("An arena needs at least one row.");
  }

  const arena: DrawnArena = {width: firstRow.length, height: rows.length, solid: [], cover: [], levels: [], stairs: []};

  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[rows.length - 1 - y];
    if (row === undefined || row.length !== arena.width) {
      throw new Error("Every row of an arena must be the same length.");
    }

    for (const character of row) {
      arena.solid.push(character === WALL || character === COVER);
      arena.cover.push(character === COVER);
      arena.levels.push(levelOfCharacter(character));
      arena.stairs.push(STAIRS[character]);
    }
  }

  placeStairs(arena);

  return arena;
}
