import {FLOOR} from "@gunsmith/engine/arena/drawing/level/Floor";
import {RAISED_LEVELS} from "@gunsmith/engine/arena/drawing/level/RaisedLevels";
import {characterAt} from "@gunsmith/engine/arena-repair/drawing/CharacterAt";
import {isReadable} from "@gunsmith/engine/arena-repair/drawing/IsReadable";
import {withCharacter} from "@gunsmith/engine/arena-repair/drawing/WithCharacter";
import {CLIMBS} from "@gunsmith/engine/arena-repair/stairs/climbs/Climbs";
import type {DrawnTile} from "@gunsmith/engine/arena-repair/types/DrawnTile";

/**
 * Draws one stair beside one of the raised tiles it is given, at the first place the engine accepts it: on floor one level
 * below the tile that is part of the arena (`main`), climbing to the tile. So a stair always joins the raised floor to the arena
 * itself, never to another piece that is cut off too. Whether the engine accepts it (floor behind it, no raised floor beside it) is
 * for `arenaFrom` to say. Nothing when there is no such place.
 */
export function addStair(
  rows: readonly string[],
  raisedTiles: readonly DrawnTile[],
  main: readonly DrawnTile[],
): string[] | undefined {
  const inMain = new Set(main.map(tile => tileKeyOfDrawn(tile)));

  for (const tile of raisedTiles) {
    const below = characterBelow(characterAt(rows, tile));
    if (below === undefined) {
      continue;
    }

    for (const climb of CLIMBS) {
      const landing = {column: tile.column - climb.columns, row: tile.row - climb.rows};
      if (characterAt(rows, landing) !== below || !inMain.has(tileKeyOfDrawn(landing))) {
        continue;
      }

      const candidate = withCharacter(rows, landing, climb.arrow);
      if (isReadable(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

/** The character the floor one level below a raised tile is drawn with, or `undefined` for a tile that is not raised. */
function characterBelow(character: string | undefined): string | undefined {
  if (character === undefined) {
    return undefined;
  }

  const level = RAISED_LEVELS[character];
  if (level === undefined) {
    return undefined;
  }

  if (level === 1) {
    return FLOOR;
  }

  return String(level - 1);
}

function tileKeyOfDrawn(tile: DrawnTile): string {
  return `${tile.column},${tile.row}`;
}
