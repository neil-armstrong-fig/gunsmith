import {STAIRS} from "@gunsmith/engine/arena/drawing/Stairs";
import {FLOOR} from "@gunsmith/engine/arena/drawing/level/Floor";
import {isReadable} from "@gunsmith/engine/arena-repair/drawing/IsReadable";
import {withCharacter} from "@gunsmith/engine/arena-repair/drawing/WithCharacter";
import type {StairsDropped} from "@gunsmith/engine/arena-repair/stairs/types/StairsDropped";
import type {DrawnTile} from "@gunsmith/engine/arena-repair/types/DrawnTile";

/**
 * Draws as floor every stair the engine would refuse: first each stair that is illegal on its own (read with every other stair
 * drawn as floor, so one bad stair cannot condemn a good one), then, if the drawing is still refused, every stair left, because two
 * stairs can be illegal only together. A legal stair is kept as the model drew it. A drawing refused for any other reason is
 * refused still; the caller checks.
 */
export function dropIllegalStairs(rows: readonly string[]): StairsDropped {
  let kept = [...rows];
  let dropped = 0;

  for (const tile of stairTilesOf(rows)) {
    if (!isReadable(withOnlyStair(rows, tile))) {
      kept = withCharacter(kept, tile, FLOOR);
      dropped += 1;
    }
  }

  if (isReadable(kept)) {
    return {rows: kept, dropped};
  }

  for (const tile of stairTilesOf(kept)) {
    kept = withCharacter(kept, tile, FLOOR);
    dropped += 1;
  }

  return {rows: kept, dropped};
}

function stairTilesOf(rows: readonly string[]): DrawnTile[] {
  const tiles: DrawnTile[] = [];

  rows.forEach((row, rowIndex) => {
    [...row].forEach((character, column) => {
      if (Object.hasOwn(STAIRS, character)) {
        tiles.push({column, row: rowIndex});
      }
    });
  });

  return tiles;
}

/** The drawing with every stair but the one on `tile` drawn as floor. */
function withOnlyStair(rows: readonly string[], tile: DrawnTile): string[] {
  return rows.map((row, rowIndex) => {
    return [...row]
      .map((character, column) => {
        if (Object.hasOwn(STAIRS, character) && (rowIndex !== tile.row || column !== tile.column)) {
          return FLOOR;
        }

        return character;
      })
      .join("");
  });
}
