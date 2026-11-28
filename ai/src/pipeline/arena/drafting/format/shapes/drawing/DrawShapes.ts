import {fillRectangle} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/FillRectangle";
import type {ShapesToDraw} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ShapesToDraw";

const WALL = "#";
const COVER = "c";
const ARROWS = {north: "^", south: "v", west: "<", east: ">"} as const;

/**
 * Draws shapes onto a grid of characters, in place: platforms, then cover and walls (a later shape is drawn over an earlier one),
 * then stairs, and the border wall last, so no shape can break it. Every shape must already be known to lie inside the grid
 * (`outsideTheArena`): a rectangle past the east edge would lengthen a row.
 */
export function drawShapes(grid: string[][], shapes: ShapesToDraw): void {
  for (const platform of shapes.platforms ?? []) {
    fillRectangle(grid, platform, String(platform.level));
  }

  for (const cover of shapes.covers ?? []) {
    fillRectangle(grid, cover, COVER);
  }

  for (const wall of shapes.walls ?? []) {
    fillRectangle(grid, wall, WALL);
  }

  for (const stair of shapes.stairs ?? []) {
    fillRectangle(grid, {x: stair.x, y: stair.y, width: 1, height: 1}, ARROWS[stair.direction]);
  }

  drawBorder(grid);
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
