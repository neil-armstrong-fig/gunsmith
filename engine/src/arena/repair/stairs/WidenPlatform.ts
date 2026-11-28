import {FLOOR} from "@gunsmith/engine/arena/drawing/level/Floor";
import {RAISED_LEVELS} from "@gunsmith/engine/arena/drawing/level/RaisedLevels";
import {characterAt} from "@gunsmith/engine/arena/repair/drawing/CharacterAt";
import {isReadable} from "@gunsmith/engine/arena/repair/drawing/IsReadable";
import {withCharacter} from "@gunsmith/engine/arena/repair/drawing/WithCharacter";
import {CLIMBS} from "@gunsmith/engine/arena/repair/stairs/climbs/Climbs";
import type {DrawnTile} from "@gunsmith/engine/arena/repair/types/DrawnTile";

/**
 * Climbs onto a second level from the first level it stands on, where that first level rings it too thinly for a stair: a stair
 * needs floor of its low level behind it, and a ring one tile thick has the ground there. So the first level grows by one tile
 * onto the ground, in a straight line out from one of the raised tiles, and the ring tile between becomes a stair climbing onto it.
 * The first level need not be reached yet: the repair's next pass gives it its own stair from the ground. Only the ground is grown
 * onto, never a wall, cover, a stair or the border (two is the highest level, so a first level always stands on the ground),
 * and the first place the engine accepts (`arenaFrom`) is taken. Nothing for a first level (its ring tile would have to be the
 * ground, which is not a level drawn with a digit) or when there is no such place.
 */
export function widenPlatform(rows: readonly string[], raisedTiles: readonly DrawnTile[]): string[] | undefined {
  for (const tile of raisedTiles) {
    const level = RAISED_LEVELS[characterAt(rows, tile) ?? ""];
    if (level === undefined) {
      continue;
    }

    const below = String(level - 1);
    for (const climb of CLIMBS) {
      const stair = {column: tile.column - climb.columns, row: tile.row - climb.rows};
      const grown = {column: tile.column - climb.columns * 2, row: tile.row - climb.rows * 2};
      if (characterAt(rows, stair) !== below || characterAt(rows, grown) !== FLOOR) {
        continue;
      }

      const candidate = withCharacter(withCharacter(rows, grown, below), stair, climb.arrow);
      if (isReadable(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}
