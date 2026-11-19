import type {ArenaShapes} from "@gunsmith/ai/pipeline/arena/arena-shapes/draft/ArenaShapesDraft";
import type {ArenaShapesCompilation} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ArenaShapesCompilation";

const WALL = "#";
const COVER = "c";
const FLOOR = ".";
const ARROWS = {north: "^", south: "v", west: "<", east: ">"} as const;

/**
 * Draws an arena's shapes into the rows of a drawing, the characters `arenaFrom` reads. Floor first, then platforms, cover and
 * walls (a later shape is drawn over an earlier one), then stairs, and the border wall last, so no shape can break it. A shape that
 * reaches past the arena is refused with a sentence naming it, because the repair shows the model that sentence. Whether the
 * drawing can be played is not asked here: the result goes through the same check as any other drawing.
 */
export function compileArenaShapes(shapes: ArenaShapes): ArenaShapesCompilation {
  const errors = outOfBounds(shapes);
  if (errors.length > 0) {
    return {ok: false, errors};
  }

  const grid = Array.from({length: shapes.height}, () => Array.from({length: shapes.width}, () => FLOOR));

  for (const platform of shapes.platforms ?? []) {
    fill(grid, platform, String(platform.level));
  }

  for (const cover of shapes.covers ?? []) {
    fill(grid, cover, COVER);
  }

  for (const wall of shapes.walls ?? []) {
    fill(grid, wall, WALL);
  }

  for (const stair of shapes.stairs ?? []) {
    fill(grid, {x: stair.x, y: stair.y, width: 1, height: 1}, ARROWS[stair.direction]);
  }

  drawBorder(grid);

  return {ok: true, drawing: {name: shapes.name, rows: grid.map(row => row.join(""))}};
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function fill(grid: string[][], rectangle: Rectangle, character: string): void {
  for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += 1) {
    for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += 1) {
      const row = grid[y];
      if (row !== undefined) {
        row[x] = character;
      }
    }
  }
}

function drawBorder(grid: string[][]): void {
  const lastRow = grid.length - 1;

  grid.forEach((row, y) => {
    const lastColumn = row.length - 1;

    row.forEach((_, x) => {
      if (y === 0 || y === lastRow || x === 0 || x === lastColumn) {
        row[x] = WALL;
      }
    });
  });
}

/** A sentence for each rectangle or stair that is not wholly on the grid. */
function outOfBounds(shapes: ArenaShapes): string[] {
  const lastColumn = shapes.width - 1;
  const lastRow = shapes.height - 1;
  const errors: string[] = [];

  const lists = [
    ["walls", shapes.walls],
    ["covers", shapes.covers],
    ["platforms", shapes.platforms],
  ] as const;

  for (const [listName, rectangles] of lists) {
    (rectangles ?? []).forEach((rectangle, index) => {
      const name = `${listName}[${index}]`;
      const endColumn = rectangle.x + rectangle.width - 1;
      const endRow = rectangle.y + rectangle.height - 1;

      if (endColumn > lastColumn) {
        errors.push(
          `${name} reaches column ${endColumn} but the arena is ${shapes.width} wide (columns 0 to ${lastColumn}): make it end at column ${lastColumn} or sooner.`,
        );
      }

      if (endRow > lastRow) {
        errors.push(
          `${name} reaches row ${endRow} but the arena is ${shapes.height} tall (rows 0 to ${lastRow}): make it end at row ${lastRow} or sooner.`,
        );
      }
    });
  }

  (shapes.stairs ?? []).forEach((stair, index) => {
    if (stair.x > lastColumn) {
      errors.push(
        `stairs[${index}] is at column ${stair.x} but the arena is ${shapes.width} wide (columns 0 to ${lastColumn}).`,
      );
    }

    if (stair.y > lastRow) {
      errors.push(
        `stairs[${index}] is at row ${stair.y} but the arena is ${shapes.height} tall (rows 0 to ${lastRow}).`,
      );
    }
  });

  return errors;
}
