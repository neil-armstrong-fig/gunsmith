import type {Arena} from "@gunsmith/engine/arena/types/Arena";

const WALL = "#";
const FLOOR = ".";

/**
 * Reads an arena off a drawing: `#` is a wall and `.` is floor. The first row is the top (north), as it is drawn, so
 * `y` grows upwards in the arena the way it does on screen.
 */
export function arenaFrom(rows: readonly string[]): Arena {
  const firstRow = rows[0];
  if (firstRow === undefined) {
    throw new Error("An arena needs at least one row.");
  }

  const width = firstRow.length;
  const solid: boolean[] = [];

  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[rows.length - 1 - y];
    if (row === undefined || row.length !== width) {
      throw new Error("Every row of an arena must be the same length.");
    }

    for (const character of row) {
      solid.push(isWall(character));
    }
  }

  return {width, height: rows.length, solid};
}

function isWall(character: string): boolean {
  if (character === WALL) {
    return true;
  }

  if (character === FLOOR) {
    return false;
  }

  throw new Error(`'${character}' is not an arena tile; use '${WALL}' for a wall or '${FLOOR}' for floor.`);
}
