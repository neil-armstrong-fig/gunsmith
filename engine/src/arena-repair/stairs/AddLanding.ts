import {FLOOR} from "@gunsmith/engine/arena/drawing/level/Floor";
import {characterAt} from "@gunsmith/engine/arena-repair/drawing/CharacterAt";
import {isReadable} from "@gunsmith/engine/arena-repair/drawing/IsReadable";
import {withCharacter} from "@gunsmith/engine/arena-repair/drawing/WithCharacter";
import {CLIMBS} from "@gunsmith/engine/arena-repair/stairs/climbs/Climbs";
import type {Climb} from "@gunsmith/engine/arena-repair/stairs/climbs/Climbs";
import type {DrawnTile} from "@gunsmith/engine/arena-repair/types/DrawnTile";

/** The level a landing is drawn at, and the character it is drawn with: one below the second level it leads to. */
const LANDING = "1";

/**
 * Climbs from the ground to a second level that stands on it, where one stair cannot (a stair climbs one level): in a straight line
 * out from one of the raised tiles, a stair onto it, a landing one level up, and a stair from the ground onto the landing, all drawn on
 * low floor that is part of the arena (`main`), with low floor of the arena behind the first stair. So a platform the model drew two
 * levels up keeps its height instead of being lowered. The first place the engine accepts (`arenaFrom`) is taken: that refuses a stair
 * that does not climb exactly one level, so a first level is never given a landing. Nothing when there is no such place.
 */
export function addLanding(
  rows: readonly string[],
  raisedTiles: readonly DrawnTile[],
  main: readonly DrawnTile[],
): string[] | undefined {
  const inMain = new Set(main.map(tile => tileKeyOfDrawn(tile)));

  for (const tile of raisedTiles) {
    for (const climb of CLIMBS) {
      const upper = stepsBack(tile, climb, 1);
      const landing = stepsBack(tile, climb, 2);
      const lower = stepsBack(tile, climb, 3);
      const behind = stepsBack(tile, climb, 4);
      const line = [upper, landing, lower, behind];
      if (!line.every(place => characterAt(rows, place) === FLOOR && inMain.has(tileKeyOfDrawn(place)))) {
        continue;
      }

      const candidate = withCharacter(
        withCharacter(withCharacter(rows, upper, climb.arrow), landing, LANDING),
        lower,
        climb.arrow,
      );
      if (isReadable(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

/** The tile so many steps back from a raised tile, against the way a stair onto it climbs. */
function stepsBack(tile: DrawnTile, climb: Climb, steps: number): DrawnTile {
  return {column: tile.column - climb.columns * steps, row: tile.row - climb.rows * steps};
}

function tileKeyOfDrawn(tile: DrawnTile): string {
  return `${tile.column},${tile.row}`;
}
